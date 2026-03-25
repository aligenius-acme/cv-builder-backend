import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { prisma } from '../utils/prisma';
import { ParsedResumeData, ExperienceEntry, EducationEntry, ContactInfo, CertificationEntry, AwardEntry } from '../types';
import { FileProcessingError } from '../utils/errors';
import { extractResumeDataWithAI } from './ai';

// Parse file content based on type
export async function parseFile(buffer: Buffer, fileName: string): Promise<string> {
  const ext = fileName.toLowerCase().split('.').pop();

  try {
    if (ext === 'pdf') {
      return await parsePDF(buffer);
    } else if (ext === 'docx') {
      return await parseDOCX(buffer);
    } else {
      throw new FileProcessingError(`Unsupported file type: ${ext}. Only PDF and DOCX are supported.`);
    }
  } catch (error) {
    if (error instanceof FileProcessingError) {
      throw error;
    }
    throw new FileProcessingError(`Failed to parse file: ${(error as Error).message}`);
  }
}

// Parse PDF file
async function parsePDF(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return cleanText(result.text);
}

// Parse DOCX file
// Uses HTML conversion so that soft returns (<w:br/>) inside paragraphs
// are preserved as newlines — extractRawText silently drops them, which
// merges content like project titles, URLs, Role and Industry lines into
// one unbreakable concatenated string.
// Tables are converted row-by-row with cells separated by " | " so that
// multi-column skill tables remain parseable.
async function parseDOCX(buffer: Buffer): Promise<string> {
  const htmlResult = await mammoth.convertToHtml({ buffer });
  if (htmlResult.value) {
    const text = htmlResult.value
      // Tables: convert each row to a line; cells separated by " | "
      .replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, (_match, rowContent) => {
        const cells = rowContent
          .replace(/<\/t[dh]>/gi, '\t')      // mark cell end with tab
          .replace(/<[^>]+>/g, '')            // strip tags inside cell
          .split('\t')
          .map((c: string) => c.trim())
          .filter((c: string) => c.length > 0);
        return cells.join(' | ') + '\n';
      })
      // Soft returns → newline (must come before generic tag strip)
      .replace(/<br\s*\/?>/gi, '\n')
      // Block-level elements → newlines
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<\/ol>/gi, '\n')
      // Strip all remaining HTML tags
      .replace(/<[^>]+>/g, '')
      // HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&ndash;/g, '–')
      .replace(/&mdash;/g, '—')
      .replace(/&hellip;/g, '...')
      .replace(/&#x2019;/g, "'")
      .replace(/&#x201C;/g, '"')
      .replace(/&#x201D;/g, '"');
    return cleanText(text);
  }
  // Fallback to raw text extraction
  const rawResult = await mammoth.extractRawText({ buffer });
  return cleanText(rawResult.value);
}

// Clean and normalize text, stripping common footer/header artifacts
function cleanText(text: string): string {
  const normalized = text
    // Common PDF ligature substitutions (special unicode glyphs pdf-parse often outputs)
    .replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl').replace(/ﬃ/g, 'ffi')
    .replace(/ﬀ/g, 'ff').replace(/ﬄ/g, 'ffl').replace(/ﬅ/g, 'st').replace(/ﬆ/g, 'st')
    // Smart quotes → straight
    .replace(/['']/g, "'").replace(/[""]/g, '"')
    // End-of-line hyphenation: "develop-\nment" → "development"
    .replace(/(\w)-\n\s*(\w)/g, '$1$2')
    // Normalize line endings and tabs
    .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .replace(/\t+/g, ' ');

  const lines = normalized.split('\n');

  const filtered = lines.filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return true; // keep blank lines for now (collapsed below)

    // Page numbers: "1", "- 1 of 3 -", "2 of 5", "Page 2", "3 | 5"
    if (/^-?\s*\d+\s*-?$/.test(trimmed)) return false;
    if (/^page\s+\d+(\s+of\s+\d+)?$/i.test(trimmed)) return false;
    if (/^-*\s*\d+\s+of\s+\d+\s*-*$/.test(trimmed)) return false;
    if (/^\d+\s*[|\/]\s*\d+$/.test(trimmed)) return false;

    // Confidential / draft watermarks
    if (/^(confidential|draft|curriculum vitae|resume|cv)$/i.test(trimmed)) return false;

    return true;
  });

  return filtered
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ +/g, ' ')
    .trim();
}

// Extract structured data from raw resume text.
// Runs rule-based parsing first. If the result is sparse (missing key sections),
// falls back to AI extraction which handles complex/non-standard layouts.
export async function extractResumeData(rawText: string, userId?: string): Promise<ParsedResumeData> {
  const ruleBasedResult = extractResumeDataRuleBased(rawText);

  if (userId && isSparseResult(ruleBasedResult)) {
    console.log('[Parser] Rule-based result is sparse — invoking AI fallback...');
    try {
      const aiResult = await extractResumeDataWithAI(rawText, userId);
      return sanitizeResumeData(mergeResumeData(ruleBasedResult, aiResult));
    } catch (aiError) {
      console.warn('[Parser] AI fallback failed, keeping rule-based result:', (aiError as Error).message);
    }
  }

  return sanitizeResumeData(ruleBasedResult);
}

// Normalises any ParsedResumeData to consistent, safe shapes regardless of source
// (rule-based parser, AI response, or data already in the DB from older code).
// Guarantees:
//  • all array fields are real JS arrays (never null / string)
//  • experience[i].description is always string[]
//  • skills is always a flat string[] (SkillCategory[] is flattened)
//  • projects[i].description is always string[] (bullet points)
//  • awards / certifications are always AwardEntry[] / CertificationEntry[]
export function sanitizeResumeData(data: ParsedResumeData): ParsedResumeData {
  // Ensure value is an array; wrap non-array non-null values in a single-item array
  const toArr = <T>(val: unknown): T[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val as T[];
    return [];
  };

  // Convert string | string[] → string[], splitting on newlines if the input is a string
  const toDescArr = (val: unknown): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return (val as any[]).map(String).map(s => s.trim()).filter(Boolean);
    if (typeof val === 'string') return val.split('\n').map(s => s.trim()).filter(Boolean);
    return [];
  };

  // Flatten flat string[] or SkillCategory[] ({ category, items[] }) to string[]
  const flattenSkills = (val: unknown): string[] => {
    if (!Array.isArray(val)) return [];
    return (val as any[]).flatMap(item => {
      if (typeof item === 'string') return item.trim() ? [item] : [];
      if (item && typeof item === 'object' && Array.isArray(item.items)) {
        return (item.items as any[]).filter(s => typeof s === 'string' && s.trim());
      }
      return [];
    });
  };

  const contact: ContactInfo = {
    name:     typeof data.contact?.name     === 'string' ? data.contact.name     || undefined : undefined,
    email:    typeof data.contact?.email    === 'string' ? data.contact.email    || undefined : undefined,
    phone:    typeof data.contact?.phone    === 'string' ? data.contact.phone    || undefined : undefined,
    location: typeof data.contact?.location === 'string' ? data.contact.location || undefined : undefined,
    linkedin: typeof data.contact?.linkedin === 'string' ? data.contact.linkedin || undefined : undefined,
    github:   typeof data.contact?.github   === 'string' ? data.contact.github   || undefined : undefined,
    website:  typeof data.contact?.website  === 'string' ? data.contact.website  || undefined : undefined,
  };

  const experience: ExperienceEntry[] = toArr<any>(data.experience)
    .map(exp => ({
      title:       typeof exp.title    === 'string' ? exp.title    : undefined,
      company:     typeof exp.company  === 'string' ? exp.company  : '',
      location:    typeof exp.location === 'string' ? exp.location : undefined,
      startDate:   typeof exp.startDate === 'string' ? exp.startDate : undefined,
      endDate:     typeof exp.endDate   === 'string' ? exp.endDate   : undefined,
      current:     typeof exp.current  === 'boolean' ? exp.current : false,
      description: toDescArr(exp.description),
    }))
    .filter(e => e.title || e.company);

  const education: EducationEntry[] = toArr<any>(data.education)
    .map(edu => ({
      degree:         typeof edu.degree         === 'string' ? edu.degree         : '',
      institution:    typeof edu.institution    === 'string' ? edu.institution    : '',
      location:       typeof edu.location       === 'string' ? edu.location       : undefined,
      graduationDate: typeof edu.graduationDate === 'string' ? edu.graduationDate : undefined,
      gpa:            typeof edu.gpa            === 'string' ? edu.gpa            : undefined,
      achievements:   toArr<string>(edu.achievements).filter(a => typeof a === 'string'),
    }))
    .filter(e => e.degree || e.institution);

  const projects = toArr<any>(data.projects)
    .map(p => ({
      name:         typeof p.name    === 'string' ? p.name    : '',
      description:  (() => {
        const raw: string[] = Array.isArray(p.description)
          ? (p.description as string[]).map((s: string) => s.trim()).filter(Boolean)
          : typeof p.description === 'string'
            ? p.description.split('\n').map((s: string) => s.trim()).filter(Boolean)
            : [];
        // Strip metadata lines that were accidentally stored as bullets (e.g. "Industry: XYZ")
        return raw.filter((s: string) => !/^(industry|client|duration|status|team\s+size|type)[\s:]/i.test(s));
      })(),
      technologies: toArr<string>(p.technologies).filter(t => typeof t === 'string'),
      // Accept both url and link fields (legacy data uses link)
      url:          typeof p.url  === 'string' ? p.url  :
                    typeof p.link === 'string' ? p.link : undefined,
      dates:        typeof p.dates === 'string' ? p.dates : undefined,
      company:      typeof p.company === 'string' ? p.company : undefined,
    }))
    .filter(p => p.name || p.description);

  const certifications: CertificationEntry[] = toArr<any>(data.certifications)
    .map(c => {
      if (typeof c === 'string') return { name: c };
      if (c && typeof c === 'object') return {
        name:   typeof c.name   === 'string' ? c.name   : '',
        issuer: typeof c.issuer === 'string' ? c.issuer : undefined,
        date:   typeof c.date   === 'string' ? c.date   : undefined,
      };
      return null;
    })
    .filter((c): c is CertificationEntry => !!c && !!(c as any).name);

  const awards: AwardEntry[] = toArr<any>(data.awards)
    .map(a => {
      if (typeof a === 'string') return { name: a };
      if (a && typeof a === 'object') return {
        name:   typeof a.name   === 'string' ? a.name   : '',
        issuer: typeof a.issuer === 'string' ? a.issuer : undefined,
        date:   typeof a.date   === 'string' ? a.date   : undefined,
      };
      return null;
    })
    .filter((a): a is AwardEntry => !!a && !!(a as any).name);

  const languages: string[] = toArr<any>(data.languages)
    .filter(l => typeof l === 'string' && l.trim())
    .map(l => l.trim());

  // Normalise volunteerWork: accept string | VolunteerWorkEntry (both shapes)
  const volunteerWork = toArr<any>(data.volunteerWork)
    .map((v: any) => {
      if (typeof v === 'string') return { role: v, organization: '' };
      if (v && typeof v === 'object') return {
        ...v,
        description: toDescArr(v.description),
      };
      return null;
    })
    .filter(Boolean);

  return {
    contact,
    summary:     typeof data.summary === 'string' ? data.summary : '',
    experience,
    education,
    skills:      flattenSkills(data.skills),
    certifications,
    projects,
    languages,
    awards,
    volunteerWork: volunteerWork.length > 0 ? (volunteerWork as any) : undefined,
    // Preserve any extended academic/creative fields as-is
    publications:             data.publications,
    leadership:               data.leadership,
    achievements:             data.achievements,
    professionalAffiliations: data.professionalAffiliations,
    grants:                   data.grants,
    teaching:                 data.teaching,
    service:                  data.service,
    speaking:                 data.speaking,
    photoUrl:                 data.photoUrl,
  };
}

// Returns true when rule-based parsing clearly missed significant resume content.
// Triggers AI fallback to recover that content.
function isSparseResult(data: ParsedResumeData): boolean {
  const expCount = data.experience.length;
  const hasDescriptions = data.experience.some(e => e.description && e.description.length > 0);
  const skillCount = Array.isArray(data.skills) ? (data.skills as string[]).length : 0;
  const eduCount = data.education.length;

  // Nothing at all was extracted
  if (expCount === 0 && eduCount === 0 && skillCount === 0) return true;
  // Has experience entries but every description array is empty (bullet points missed)
  if (expCount > 0 && !hasDescriptions) return true;
  // Only 1 or fewer experience entries AND no education — likely missed section headers
  if (expCount <= 1 && eduCount === 0 && skillCount < 5) return true;

  return false;
}

// Merges rule-based and AI results. AI is primary (handles complex layouts);
// rule-based regex wins for contact fields where it is more reliable (email, phone, URLs).
function mergeResumeData(ruleBased: ParsedResumeData, ai: ParsedResumeData): ParsedResumeData {
  const merged: ParsedResumeData = { ...ai };

  // Contact: rule-based regex is reliable for structured fields; AI wins for name/location
  merged.contact = {
    name: ruleBased.contact.name || ai.contact?.name || '',
    email: ruleBased.contact.email || ai.contact?.email || '',
    phone: ruleBased.contact.phone || ai.contact?.phone || '',
    location: ruleBased.contact.location || ai.contact?.location || '',
    linkedin: ruleBased.contact.linkedin || ai.contact?.linkedin || '',
    github: ruleBased.contact.github || ai.contact?.github || '',
    website: ruleBased.contact.website || ai.contact?.website || '',
  };

  // Skills: union — keep all from AI, add any extras from rule-based keyword scan
  const aiSkills = Array.isArray(ai.skills) ? (ai.skills as string[]) : [];
  const ruleSkills = Array.isArray(ruleBased.skills) ? (ruleBased.skills as string[]) : [];
  const aiSkillsLower = new Set(aiSkills.map(s => s.toLowerCase()));
  const extraSkills = ruleSkills.filter(s => !aiSkillsLower.has(s.toLowerCase()));
  merged.skills = [...aiSkills, ...extraSkills];

  // If AI missed summary but rule-based found it, keep it
  if (!merged.summary && ruleBased.summary) merged.summary = ruleBased.summary;

  console.log('[Parser] Merged AI + rule-based result:', {
    contact: !!merged.contact.name || !!merged.contact.email,
    experience: merged.experience.length,
    education: merged.education.length,
    skills: (merged.skills as string[]).length,
  });

  return merged;
}

// Rule-based extraction
function extractResumeDataRuleBased(rawText: string): ParsedResumeData {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const data: ParsedResumeData = {
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    awards: [],
    contact: extractContactInfo(lines),
  };

  // Section header patterns - more flexible matching
  // Patterns now handle: "SECTION:", "Section", "SECTION", "Section Name", etc.
  const sectionPatterns: { pattern: RegExp; section: string }[] = [
    // Summary
    { pattern: /^(professional\s+)?summary:?$|^profile:?$|^about(\s+me)?:?$|^objective:?$|^career\s+(objective|summary):?$|^experience\s+summary:?$|^summary\s+of\s+(experience|qualifications):?$|^executive\s+summary:?$|^personal\s+statement:?$|^introduction:?$|^professional\s+profile:?$|^work\s+summary:?$|^overview:?$|^highlights?:?$|^key\s+highlights?:?$|^professional\s+overview:?$|^candidate\s+summary:?$|^strengths?:?$/i, section: 'summary' },
    // Experience
    { pattern: /^work\s+experience:?$|^employment(\s+history)?:?$|^work\s+history:?$|^professional\s+experience:?$|^career\s+history:?$|^relevant\s+experience:?$|^job\s+history:?$|^experience:?$|^positions?\s+held:?$|^professional\s+background:?$|^technical\s+experience:?$|^industry\s+experience:?$|^consulting\s+experience:?$|^research\s+experience:?$|^military\s+service:?$|^internship(s)?:?$|^work\s+placement(s)?:?$/i, section: 'experience' },
    // Education
    { pattern: /^education(al)?(\s+background)?:?$|^academic(\s+background)?:?$|^qualifications:?$|^academic\s+credentials:?$|^schooling:?$|^degrees?:?$|^academic\s+history:?$|^educational\s+qualifications:?$|^training\s+(&|and)\s+education:?$|^education\s+(&|and)\s+training:?$/i, section: 'education' },
    // Skills
    { pattern: /^(technical\s+)?skills:?$|^core\s+competencies:?$|^competencies:?$|^expertise:?$|^technologies:?$|^areas?\s+of\s+expertise:?$|^key\s+skills:?$|^skills?\s+(summary|set):?$|^proficiencies:?$|^abilities:?$|^technical\s+proficiencies:?$|^technical\s+expertise:?$|^tools?\s+and\s+technologies:?$|^tech\s+stack:?$|^technology\s+stack:?$|^skills\s+(&|and)\s+tools?:?$|^languages\s+(&|and)\s+technologies:?$|^professional\s+skills:?$|^relevant\s+skills:?$|^technical\s+background:?$|^technical\s+knowledge:?$/i, section: 'skills' },
    // Certifications
    { pattern: /^certifications?:?$|^licenses?(\s+(&|and)\s+certifications?)?:?$|^professional\s+certifications?:?$|^credentials:?$|^professional\s+development:?$|^training:?$|^courses?:?$|^certificate(s)?:?$|^accreditations?:?$|^continuing\s+education:?$|^professional\s+training:?$/i, section: 'certifications' },
    // Projects
    { pattern: /^projects?:?$|^personal\s+projects?:?$|^key\s+projects?:?$|^notable\s+projects?:?$|^side\s+projects?:?$|^portfolio:?$|^selected\s+projects?:?$|^freelance\s+projects?:?$|^open\s+source:?$|^client\s+projects?:?$/i, section: 'projects' },
    // Languages
    { pattern: /^languages?:?$|^language\s+skills?:?$|^language\s+proficiency:?$|^foreign\s+languages?:?$|^spoken\s+languages?:?$|^natural\s+languages?:?$/i, section: 'languages' },
    // Awards
    { pattern: /^awards?:?$|^honors?(\s+(&|and)\s+awards?)?:?$|^achievements?:?$|^recognition:?$|^accomplishments?:?$|^distinctions?:?$|^scholarships?:?$|^honors?\s+(&|and)\s+recognition:?$/i, section: 'awards' },
    // Extra sections
    { pattern: /^publications?:?$|^research:?$|^papers?:?$|^conference\s+papers?:?$|^journal\s+articles?:?$/i, section: 'projects' },
    { pattern: /^volunteer(ing)?(\s+experience)?:?$|^community\s+(service|involvement):?$|^extracurricular:?$|^leadership(\s+experience)?:?$/i, section: 'experience' },
    { pattern: /^interests?:?$|^hobbies?:?$|^activities?:?$/i, section: 'interests' },
    { pattern: /^references?:?$/i, section: 'references' },
  ];

  // Identify sections and their content
  const sections: { section: string; startIndex: number; endIndex: number; headerLine: string }[] = [];
  const usedLineIndices = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Clean line for matching:
    // 1. Remove trailing colons, dashes, underscores
    // 2. Strip leading emoji (e.g. "💼 Experience", "🎓 Education")
    // 3. Strip leading numbering (e.g. "1. Experience", "II. Education", "A. Skills")
    const cleanLine = line
      .replace(/[:\-–—_]+$/, '')
      .replace(/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+\s*/gu, '')
      .replace(/^(?:\d+\.|[IVXivx]+\.|[A-Z]\.)\s+/, '')
      .trim();

    // Check if line is a section header
    // Headers are usually: short, ALL CAPS, title case, or end with colon
    const isLikelyHeader = (
      cleanLine.length < 65 &&
      (cleanLine.length < 45 || cleanLine === cleanLine.toUpperCase() || line.endsWith(':'))
    );

    if (isLikelyHeader) {
      for (const { pattern, section } of sectionPatterns) {
        if (pattern.test(cleanLine)) {
          sections.push({ section, startIndex: i + 1, endIndex: lines.length, headerLine: line });
          usedLineIndices.add(i);
          break;
        }
      }
    }
  }

  // Set end indices for each section
  for (let i = 0; i < sections.length - 1; i++) {
    sections[i].endIndex = sections[i + 1].startIndex - 1;
  }

  // Process each identified section
  for (const { section, startIndex, endIndex } of sections) {
    const content = lines.slice(startIndex, endIndex);
    for (let j = startIndex; j < endIndex; j++) {
      usedLineIndices.add(j);
    }
    processSection(data, section, content);
  }

  // Collect unassigned lines (excluding contact info at the top)
  const unassignedLines: string[] = [];
  // Skip contact header area — contact is typically within first 8 lines
  const contactEndIndex = Math.min(8, lines.length);

  for (let i = contactEndIndex; i < lines.length; i++) {
    if (!usedLineIndices.has(i)) {
      unassignedLines.push(lines[i]);
    }
  }

  // If we have unassigned content and no summary, try to use it as summary.
  // Priority: lines that appear BEFORE the first detected section (intro paragraphs).
  if (!data.summary && unassignedLines.length > 0) {
    const firstSectionStart = sections.length > 0 ? sections[0].startIndex : lines.length;

    // First try: unassigned lines that appear before the first section (pre-section intro)
    const preSection = lines
      .slice(contactEndIndex, firstSectionStart)
      .filter((_, idx) => !usedLineIndices.has(contactEndIndex + idx));

    const summaryCandidate = preSection.length > 0 ? preSection : unassignedLines;

    const summaryLines = summaryCandidate.filter(line => {
      const hasDate = /\b(19|20)\d{2}\b/.test(line) || /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(line);
      const isShortTitle = line.length < 50 && /\b(Engineer|Developer|Manager|Director|Lead)\b/i.test(line) && !/experience|years/i.test(line);
      const isSectionHeader = line.length < 45 && /^[A-Z\s]+$/.test(line);
      return !hasDate && !isShortTitle && !isSectionHeader && line.length > 20;
    });

    if (summaryLines.length > 0 && summaryLines.length <= 15) {
      data.summary = formatWithBullets(summaryLines);
    }
  }

  // Always supplement section-parsed skills with full-text keyword scan.
  // This catches skills mentioned in experience/project bullets that weren't
  // in a dedicated skills section, and also acts as fallback when section
  // parsing produced nothing.
  const textScannedSkills = extractSkillsFromText(rawText);
  const existingSkillsLower = new Set((data.skills as string[]).map(s => s.toLowerCase()));
  for (const s of textScannedSkills) {
    if (!existingSkillsLower.has(s.toLowerCase())) {
      (data.skills as string[]).push(s);
    }
  }

  // Fallback: If no experience found via sections and no projects section was found,
  // try to extract from full text. Skip when projects exist — in project-only resumes
  // the full-text scan would pick up project metadata as fake experience entries.
  if (data.experience.length === 0 && (data.projects?.length ?? 0) === 0) {
    data.experience = parseExperience(lines);
  }

  // Fallback: If no education found via sections, try to extract from full text
  if (data.education.length === 0) {
    data.education = parseEducation(lines);
  }

  // Fallback: If no certifications found, try to extract from full text
  if (data.certifications && data.certifications.length === 0) {
    data.certifications = extractCertificationsFromText(lines);
  }

  // Fallback: If no languages found, try to extract from full text
  if (data.languages && data.languages.length === 0) {
    data.languages = extractLanguagesFromText(rawText);
  }

  // Log parsing results for debugging
  console.log('[Parser] Sections found:', sections.map(s => s.section).join(', ') || 'none');
  console.log('[Parser] Data extracted:', {
    hasContact: !!data.contact.name || !!data.contact.email,
    hasSummary: !!data.summary,
    experienceCount: data.experience.length,
    educationCount: data.education.length,
    skillsCount: Array.isArray(data.skills) ? data.skills.length : 0,
    certificationsCount: data.certifications?.length || 0,
    projectsCount: data.projects?.length || 0,
    languagesCount: data.languages?.length || 0,
    awardsCount: data.awards?.length || 0,
  });

  return data;
}

// Extract certifications from full text as fallback
function extractCertificationsFromText(lines: string[]): CertificationEntry[] {
  const certifications: CertificationEntry[] = [];
  // Only match lines that contain actual certification words — avoid false positives
  // from platform names (AWS, Azure, etc.) that appear in skill or experience descriptions.
  const certKeywords = /\b(certified|certification|certificate|license|licensed|credential|PMP|PMI|CISSP|CompTIA|CPA|CFA|ITIL|PRINCE2|Six\s+Sigma|Scrum\s+Master|CSM|CISM|CISA|CKA|CKAD|CEH|OSCP|Series\s+\d+)\b/i;

  for (const line of lines) {
    if (certKeywords.test(line) && line.length < 150) {
      // Check if it's not already a section header
      if (!/^(certifications?|licenses?|credentials?):?$/i.test(line.trim())) {
        const cert: CertificationEntry = { name: line.trim() };
        const dateMatch = line.match(/\b(19|20)\d{2}\b/);
        if (dateMatch) {
          cert.date = dateMatch[0];
          cert.name = line.replace(dateMatch[0], '').trim();
        }
        if (cert.name.length > 5) {
          certifications.push(cert);
        }
      }
    }
  }

  return certifications;
}

// Extract languages from full text as fallback
function extractLanguagesFromText(text: string): string[] {
  const languages: string[] = [];
  const languageKeywords = [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Mandarin', 'Cantonese',
    'Japanese', 'Korean', 'Portuguese', 'Italian', 'Russian', 'Arabic', 'Hindi',
    'Bengali', 'Urdu', 'Vietnamese', 'Thai', 'Dutch', 'Polish', 'Turkish',
    'Hebrew', 'Greek', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Czech',
    'Hungarian', 'Romanian', 'Indonesian', 'Malay', 'Tagalog', 'Swahili'
  ];

  // Look for language mentions with proficiency indicators
  const proficiencyPattern = /\b(native|fluent|proficient|intermediate|basic|conversational|bilingual|multilingual)\b/i;

  for (const lang of languageKeywords) {
    const regex = new RegExp(`\\b${lang}\\b`, 'i');
    if (regex.test(text)) {
      // Check if it appears near proficiency indicator or in a language context
      const langMatch = text.match(new RegExp(`${lang}[^.]*?(${proficiencyPattern.source})|(?:${proficiencyPattern.source})[^.]*?${lang}`, 'i'));
      if (langMatch || text.toLowerCase().includes('language')) {
        languages.push(lang);
      }
    }
  }

  return [...new Set(languages)];
}

// Extract contact information
function extractContactInfo(lines: string[]): ContactInfo {
  const contact: ContactInfo = {};
  // Search first 20 lines — some resume templates put more header content than expected
  const headerLines = lines.slice(0, 20);
  const headerText = headerLines.join(' ');

  // Name: first line that doesn't look like contact info or a job title subtitle.
  // Handles optional honorific prefixes (Dr., Mr., Ms., Prof.) and separator-based titles.
  for (const line of lines.slice(0, 8)) {
    let cleaned = line.replace(/^[•\-*▪◦›]\s*/, '').trim();
    // Strip honorific prefix before testing
    const honorificStripped = cleaned.replace(/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Prof\.?|Eng\.?)\s+/i, '').trim();
    const testLine = honorificStripped || cleaned;
    if (
      testLine.length > 1 &&
      testLine.length < 100 &&
      !/@/.test(testLine) &&
      !/https?:\/\//i.test(testLine) &&
      !/\d{3}.*\d{3}/.test(testLine) &&   // not a phone
      !/^(engineer|developer|designer|manager|analyst|consultant|architect|director|lead|senior|junior|full.stack|front.end|back.end|software|product|data|devops|specialist|coordinator)/i.test(testLine)
    ) {
      // Strip title portion that follows a separator like "–", "|", "/" on the same line
      const separatorMatch = testLine.match(/^([^|–—\/]+?)\s*[|–—\/]\s*.+$/);
      let candidate = separatorMatch ? separatorMatch[1].trim() : testLine;
      // Restore honorific if stripped
      if (honorificStripped !== cleaned && candidate === honorificStripped) {
        candidate = cleaned.replace(/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Prof\.?|Eng\.?)\s+/i, '').trim();
      }
      // Only accept if the result looks like a name (alphabetic, reasonable length)
      if (candidate.length > 1 && candidate.length < 60 && /^[A-Za-z\s\-'.]+$/.test(candidate)) {
        contact.name = candidate;
        break;
      }
    }
  }

  // Email — search full header area
  const emailMatch = headerText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (emailMatch) contact.email = emailMatch[0];

  // Phone — handles US, international (+XX), Pakistani (+92), UK (+44), and common formats
  const phoneMatch = headerText.match(
    /(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4}(?!\d)/
  );
  if (phoneMatch) {
    const p = phoneMatch[0].trim();
    // Must contain at least 7 digits to be a real phone number
    if ((p.match(/\d/g) || []).length >= 7) contact.phone = p;
  }

  // LinkedIn — handle URL variants and common OCR/typo issues
  const linkedinMatch = headerText.match(
    /(?:https?:\/\/)?(?:www\.)?lin(?:ke?d?(?:ei|ie)?|fied?)in\.com\/in\/([\w-]+)/i
  );
  if (linkedinMatch) contact.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;

  // GitHub
  const githubMatch = headerText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([\w-]+)/i);
  if (githubMatch) contact.github = `https://github.com/${githubMatch[1]}`;

  // Portfolio / personal website (any URL that is not LinkedIn or GitHub)
  const websiteMatch = headerText.match(
    /https?:\/\/(?!(?:www\.)?(?:lin(?:ke?d?(?:ei|ie)?|fied?)in|github)\.com)[\w.-]+\.[a-z]{2,}(?:\/[\w./-]*)?/i
  );
  if (websiteMatch) contact.website = websiteMatch[0];

  // Location — handle "City, ST", "City, ST ZIP", "City, Country", "City, Country (Remote)"
  // Require a known 2-letter US state OR a country/region name to avoid false positives.
  const US_STATES = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/;
  const COUNTRY_NAMES = /\b(USA|U\.S\.A|UK|U\.K|England|Scotland|Wales|Ireland|Canada|Australia|New\s+Zealand|Germany|France|Italy|Spain|Netherlands|Belgium|Switzerland|Austria|Sweden|Norway|Denmark|Finland|Poland|Czech|Hungary|Romania|Bulgaria|Croatia|Serbia|Ukraine|Russia|Turkey|Portugal|Greece|Israel|Egypt|Morocco|Ghana|Nigeria|Kenya|Tanzania|South\s+Africa|Ethiopia|Uganda|Rwanda|India|Pakistan|Bangladesh|Sri\s+Lanka|Nepal|Afghanistan|Iran|Iraq|Saudi\s+Arabia|UAE|Qatar|Kuwait|Bahrain|Oman|Jordan|Lebanon|Singapore|Malaysia|Philippines|Indonesia|Thailand|Vietnam|Japan|South\s+Korea|China|Taiwan|Hong\s+Kong|Brazil|Mexico|Argentina|Colombia|Chile|Peru|Remote)\b/i;
  const locationMatch = headerText.match(
    /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?),\s*([A-Z]{2}(?:\s+\d{5})?|[A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]+)?)\b/
  );
  if (locationMatch) {
    const stateOrCountry = locationMatch[2];
    if (US_STATES.test(stateOrCountry) || COUNTRY_NAMES.test(stateOrCountry)) {
      contact.location = locationMatch[0];
    }
  }
  // Fallback: detect major international cities that commonly appear without a country suffix
  if (!contact.location) {
    const MAJOR_CITIES = /\b(Lahore|Karachi|Islamabad|Rawalpindi|Faisalabad|Peshawar|Multan|Quetta|Hyderabad|Mumbai|Delhi|New\s+Delhi|Bangalore|Bengaluru|Chennai|Kolkata|Pune|Ahmedabad|Nairobi|Lagos|Accra|Cairo|Casablanca|Johannesburg|Cape\s+Town|Dhaka|Colombo|Kathmandu|Kabul|Tehran|Baghdad|Riyadh|Jeddah|Doha|Abu\s+Dhabi|Dubai|Bangkok|Jakarta|Manila|Kuala\s+Lumpur|Hanoi|Ho\s+Chi\s+Minh|Taipei|Seoul|Tokyo|Beijing|Shanghai|Shenzhen|Istanbul|Warsaw|Prague|Budapest|Bucharest|Kyiv|Moscow|Vienna|Zurich|Amsterdam|Brussels|Lisbon|Athens|Toronto|Vancouver|Montreal|Sydney|Melbourne|Auckland|Mexico\s+City|Sao\s+Paulo|Buenos\s+Aires|Bogota|Lima|Santiago)\b/i;
    const cityMatch = headerText.match(MAJOR_CITIES);
    if (cityMatch) {
      // Grab a following country/region if present on the same segment
      const afterCity = headerText.slice(headerText.indexOf(cityMatch[0]) + cityMatch[0].length);
      const countryFollow = afterCity.match(/^[\s,–-]+([A-Z][a-zA-Z\s]{2,25?})(?=\s*[\n|,]|$)/);
      contact.location = cityMatch[0] + (countryFollow ? ', ' + countryFollow[1].trim() : '');
    }
  }
  // Also check for "Remote" as a standalone location marker
  if (!contact.location && /\bRemote\b/i.test(headerText)) {
    contact.location = 'Remote';
  }

  return contact;
}

// Strip existing bullet characters and return plain lines joined
function formatWithBullets(lines: string[]): string {
  return lines
    .map(line => line.replace(/^[•\-*▪◦›●○]\s*/, '').trim())
    .filter(line => line.length > 0)
    .join('\n');
}

// Process section content
function processSection(
  data: ParsedResumeData,
  section: string,
  content: string[]
): void {
  switch (section) {
    case 'summary':
      // Format all summary lines with bullets
      data.summary = formatWithBullets(content);
      break;
    case 'experience':
      data.experience = parseExperience(content);
      break;
    case 'education':
      data.education = parseEducation(content);
      break;
    case 'skills':
      data.skills = parseSkills(content);
      break;
    case 'certifications':
      data.certifications = parseCertifications(content);
      break;
    case 'projects':
      data.projects = parseProjects(content);
      break;
    case 'languages':
      data.languages = parseLanguages(content);
      break;
    case 'awards':
      data.awards = parseAwards(content);
      break;
  }
}

// Parse certifications
function parseCertifications(content: string[]): CertificationEntry[] {
  const certifications: CertificationEntry[] = [];

  // Common issuer names — used to detect when an issuer appears on its own line
  // (happens with two-column PDF layouts that pdf-parse serialises row-by-row)
  const KNOWN_ISSUERS = /^(microsoft|google|amazon|aws|coursera|udemy|linkedin\s+learning|pluralsight|meta|oracle|cisco|comptia|pmi|scrum\s+alliance|ibm|salesforce|adobe|edx|datacamp|udacity|harvard|mit|stanford|duke|johns\s+hopkins|yale|columbia)(\s+certified)?$/i;

  for (const line of content) {
    const trimmed = line.replace(/^[•\-*▪◦›]\s*/, '').trim();
    if (trimmed.length < 3) continue;

    // If this looks like a standalone issuer name, attach it to the previous cert
    if (KNOWN_ISSUERS.test(trimmed) && certifications.length > 0) {
      const last = certifications[certifications.length - 1];
      if (!last.issuer) last.issuer = trimmed;
      continue;
    }

    const cert: CertificationEntry = { name: trimmed };

    // Extract year if present — also strip surrounding parens/brackets after year removal
    const dateMatch = trimmed.match(/\b(19|20)\d{2}\b/);
    if (dateMatch) {
      cert.date = dateMatch[0];
      cert.name = trimmed
        .replace(dateMatch[0], '')
        .replace(/\(\s*\)/g, '')   // remove empty "()" left after year extraction
        .replace(/\[\s*\]/g, '')   // remove empty "[]" left after year extraction
        .trim()
        .replace(/\s{2,}/g, ' ')
        .replace(/[-–—,|]\s*$/, '') // trailing separators
        .trim();
    }

    // Extract issuer if separated by dash/comma/pipe
    const parts = cert.name.split(/\s+[-–—|,]\s+/);
    if (parts.length > 1) {
      cert.name = parts[0].trim();
      cert.issuer = parts.slice(1).join(', ').trim();
    }

    if (cert.name.length > 3) certifications.push(cert);
  }

  return certifications;
}

// Parse languages
function parseLanguages(content: string[]): string[] {
  const languages: string[] = [];

  for (const line of content) {
    // Split by common delimiters
    const parts = line.split(/[,;|•·]/);
    for (const part of parts) {
      const lang = part.replace(/^[-*]\s*/, '').trim();
      if (lang.length > 1 && lang.length < 50) {
        languages.push(lang);
      }
    }
  }

  return [...new Set(languages)];
}

// Parse awards
function parseAwards(content: string[]): AwardEntry[] {
  const awards: AwardEntry[] = [];

  for (const line of content) {
    if (line.length < 5) continue;

    const award: AwardEntry = { name: line };

    // Try to extract date
    const dateMatch = line.match(/\b(19|20)\d{2}\b/);
    if (dateMatch) {
      award.date = dateMatch[0];
      award.name = line.replace(dateMatch[0], '').trim();
    }

    // Try to extract issuer (often after a dash or comma)
    const parts = award.name.split(/[-–—,]/);
    if (parts.length > 1) {
      award.name = parts[0].trim();
      award.issuer = parts.slice(1).join(',').trim();
    }

    if (award.name.length > 3) {
      awards.push(award);
    }
  }

  return awards;
}

// Parse experience entries
function parseExperience(content: string[]): ExperienceEntry[] {
  const experiences: ExperienceEntry[] = [];
  let current: Partial<ExperienceEntry> | null = null;

  // Multiple date patterns to catch various formats including European (MM/YYYY, MM.YYYY)
  const datePatterns = [
    // "Jan 2020 – Present", "January 2020 to December 2022"
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*'?\d{2,4}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*'?\d{2,4}|Present|Current|Now|Ongoing)/i,
    // "March – November 2023" (month range, year only on end date)
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*[-–—to]+\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*'?\d{2,4}/i,
    // "01/2020 – 12/2022", "01/20 – Present"
    /\d{1,2}\/\d{2,4}\s*[-–—to]+\s*(?:\d{1,2}\/\d{2,4}|Present|Current|Now)/i,
    // "2020.01 – 2022.12" (European dot format)
    /\d{4}\.\d{2}\s*[-–—]\s*(?:\d{4}\.\d{2}|Present|Current)/i,
    // "Q1 2020 – Q3 2022"
    /Q[1-4]\s+\d{4}\s*[-–—to]+\s*(?:Q[1-4]\s+\d{4}|Present|Current|Now)/i,
    // "Summer 2021 – Fall 2022", "Spring 2023 – Present"
    /(?:Spring|Summer|Fall|Autumn|Winter)\s+\d{4}\s*[-–—to]+\s*(?:(?:Spring|Summer|Fall|Autumn|Winter)\s+\d{4}|Present|Current|Now)/i,
    // "2020 – 2023", "2020 - Present"
    /\d{4}\s*[-–—to]+\s*(?:\d{4}|Present|Current|Now|Ongoing)/i,
    // Single year "2020" only when preceded by typical keywords — handled via context
  ];

  const jobTitlePatterns = [
    /\b(Engineer|Developer|Manager|Director|Lead|Senior|Junior|Analyst|Designer|Architect|Consultant|Specialist|Coordinator|Administrator|Intern|Associate|Officer|Executive|VP|CTO|CEO|CFO|COO|CIO|Head|Principal|Staff|Fellow|Founder|Co-founder|Contractor|Freelance|Researcher|Scientist|Technician|Programmer|Strategist|Advisor|Supervisor|President|Partner|Scrum\s+Master|Product\s+Owner)\b/i,
  ];

  const saveExperience = () => {
    if (current && (current.title || current.company)) {
      // Ensure description is an array
      if (!current.description) current.description = [];
      if (!current.title) current.title = current.company || 'Unknown Position';
      if (!current.company) current.company = '';
      experiences.push(current as ExperienceEntry);
    }
  };

  for (let i = 0; i < content.length; i++) {
    const line = content[i];

    // Check if line contains dates
    let dateMatch = null;
    for (const pattern of datePatterns) {
      dateMatch = line.match(pattern);
      if (dateMatch) break;
    }

    // Skip project/experience metadata labels — these are not job titles
    if (/^(role|title|position|industry|responsibilities|tools?\s*(?:&|and)?\s*technologies?|tech\s+stack|client|company|duration|status|type)[\s:]/i.test(line)) continue;

    const hasJobTitle = jobTitlePatterns.some(p => p.test(line));
    const isBulletPoint = /^[•\-*▪◦›●○]\s*/.test(line);
    const startsWithActionVerb = /^(?:Led|Built|Developed|Created|Managed|Designed|Implemented|Achieved|Improved|Reduced|Increased|Delivered|Spearheaded|Established|Launched|Drove|Orchestrated|Streamlined|Optimized|Automated|Integrated|Collaborated|Mentored|Trained|Analyzed|Researched|Executed|Coordinated|Architected|Engineered|Deployed|Maintained|Migrated|Refactored|Upgraded|Configured|Monitored|Debugged|Resolved|Troubleshot|Released|Shipped|Authored|Published|Presented|Negotiated|Facilitated|Partnered|Liaised|Administered|Supported|Hired|Recruited|Onboarded|Evaluated|Reviewed|Assessed|Planned|Scoped|Prioritized|Oversaw|Directed|Supervised|Guided|Coached|Scaled|Expanded|Grew|Generated|Produced|Secured|Raised|Designed|Prototyped|Tested|Validated|Documented|Standardized|Consolidated|Aligned|Defined|Introduced|Pioneered|Transformed|Revamped|Overhauled|Diagnosed|Investigated|Identified|Proposed|Recommended|Ensured|Enforced|Implemented|Reengineered|Redesigned|Rebranded|Replatformed|Containerized|Provisioned|Bootstrapped|Enabled|Empowered|Accelerated|Enhanced|Adapted|Localized|Internationalized|Integrated|Interfaced|Connected|Unified|Centralized|Decentralized|Abstracted|Encapsulated|Modularized|Refactored|Parameterized|Serialized|Indexed|Cached|Proxied|Sharded|Replicated|Synchronized|Orchestrated|Scheduled|Queued|Streamed|Processed|Parsed|Rendered|Compiled|Transpiled|Bundled|Minified)\b/i.test(line);

    if (dateMatch) {
      // Line with date - likely a new entry or contains date for current entry
      const dates = dateMatch[0].split(/[-–—]|to/i).map(d => d.trim());
      const remainder = line.replace(dateMatch[0], '').trim().replace(/^[|,\-–—]\s*/, '').trim();

      if (current && current.title && !current.startDate) {
        // Add date to current entry — also pick up company from remainder if on same line
        current.startDate = dates[0];
        current.endDate = dates[1] || dates[0];
        current.current = /present|current|now|ongoing/i.test(dates[1] || '');
        if (remainder && !current.company) current.company = remainder;
      } else {
        // Save previous entry and start new one
        saveExperience();
        // "Title | Company | Date" all on one line — split remainder on pipe
        let title = remainder;
        let company = '';
        if (/[|]/.test(remainder)) {
          const rParts = remainder.split('|').map(p => p.trim()).filter(p => p.length > 0);
          title = rParts[0];
          company = rParts.slice(1).join(' ');
        } else if (/\s+at\s+/i.test(remainder)) {
          const rParts = remainder.split(/\s+at\s+/i);
          title = rParts[0].trim();
          company = rParts[1]?.trim() || '';
        }
        current = {
          title,
          company,
          startDate: dates[0],
          endDate: dates[1] || dates[0],
          current: /present|current|now|ongoing/i.test(dates[1] || ''),
          description: [],
        };
      }
    } else if (hasJobTitle && !isBulletPoint && !startsWithActionVerb && line.length < 120) {
      // Likely a job title line - save previous and start new
      saveExperience();

      // Check if line contains company info (often separated by | or "at" or "–")
      let title = line;
      let company = '';
      let location = '';

      if (/\s+at\s+/i.test(line)) {
        const parts = line.split(/\s+at\s+/i);
        title = parts[0].trim();
        company = parts[1]?.trim() || '';
      } else if (/[|]/.test(line)) {
        const parts = line.split('|').map(p => p.trim());
        title = parts[0];
        company = parts[1] || '';
        if (parts[2]) location = parts[2];
      } else if (/\s+[–—]\s+/.test(line) && !dateMatch) {
        // "Software Engineer – Google" or "Google – Software Engineer"
        const parts = line.split(/\s+[–—]\s+/);
        if (parts.length === 2) {
          // Heuristic: shorter part is likely the title
          if (parts[0].length <= parts[1].length) {
            title = parts[0].trim();
            company = parts[1].trim();
          } else {
            company = parts[0].trim();
            title = parts[1].trim();
          }
        }
      }

      current = {
        title,
        company,
        location,
        description: [],
      };
    } else if ((isBulletPoint || startsWithActionVerb) && current) {
      // Bullet point or action verb line - add to description
      current.description = current.description || [];
      const cleanLine = line.replace(/^[•\-*▪◦›●○]\s*/, '').trim();
      if (cleanLine.length > 5) {
        // Always add bullet point formatting
        current.description.push(cleanLine);
      }
    } else if (current && !current.company && line.length < 100 && line.length > 3 && !isBulletPoint) {
      // Could be company name or location line
      const cleanLine = line.replace(/^[•\-*▪◦›●○]\s*/, '').trim();

      // Check for location patterns
      const locationMatch = cleanLine.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2}(?:\s+\d{5})?)/);

      if (/[|–—,]/.test(cleanLine) && !locationMatch) {
        const parts = cleanLine.split(/[|–—,]/);
        current.company = parts[0]?.trim() || cleanLine;
        if (parts[1]) {
          current.location = parts.slice(1).join(', ').trim();
        }
      } else if (locationMatch) {
        current.location = locationMatch[0];
        const companyPart = cleanLine.replace(locationMatch[0], '').replace(/[,|–—]\s*$/, '').trim();
        if (companyPart && !current.company) {
          current.company = companyPart;
        }
      } else {
        current.company = cleanLine;
      }
    } else if (current && line.length > 20) {
      // Long line - might be additional description content
      current.description = current.description || [];
      const cleanLine = line.replace(/^[•\-*▪◦›●○]\s*/, '').trim();
      if (cleanLine.length > 10) {
        // Always add bullet point formatting
        current.description.push(cleanLine);
      }
    }
  }

  // Don't forget the last entry
  saveExperience();

  return experiences;
}

// Parse education entries
function parseEducation(content: string[]): EducationEntry[] {
  const education: EducationEntry[] = [];
  let current: Partial<EducationEntry> | null = null;

  // Comprehensive degree patterns — covers US, UK, European, South Asian conventions
  const DEGREE_RE = /\b(Bachelor(?:'s)?|Master(?:'s)?|Ph\.?D\.?|D\.?Phil\.?|Doctor(?:ate)?|Associate(?:'s)?|Juris\s+Doctor|J\.?D\.?|M\.?D\.?|M\.?B\.?B\.?S\.?|Pharm\.?D\.?|D\.?D\.?S\.?|D\.?V\.?M\.?|B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|B\.?Sc\.?|M\.?Sc\.?|B\.?Tech\.?|M\.?Tech\.?|B\.?E\.?|M\.?E\.?|B\.?Eng\.?|M\.?Eng\.?|LLB|LLM|HND|HNC|A\.?A\.?|A\.?S\.?|Diploma|Certificate\s+(?:in|of)|Foundation\s+Degree)\b/i;

  // Lines that look like institution names
  const INSTITUTION_RE = /\b(university|college|institute|school|academy|polytechnic|faculty|conservatory)\b/i;

  for (const line of content) {
    const hasDegree = DEGREE_RE.test(line);
    const hasInstitution = INSTITUTION_RE.test(line);

    if (hasDegree) {
      if (current && current.degree) {
        education.push(current as EducationEntry);
      }
      // Try to extract institution from same line (e.g. "B.S. Computer Science | MIT | 2020")
      let degree = line;
      let institution = '';
      let graduationDate: string | undefined;

      if (/[|–—]/.test(line)) {
        const parts = line.split(/[|–—]/).map(p => p.trim());
        degree = parts[0];
        institution = parts[1] || '';
        const yearPart = parts[2] || parts[1] || '';
        const yearMatch = yearPart.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) graduationDate = yearMatch[0];
      } else {
        // Check if year is embedded in the line
        const yearMatch = line.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
          graduationDate = yearMatch[0];
          degree = line.replace(yearMatch[0], '').trim().replace(/[\s,]+$/, '');
        }
      }

      current = { degree, institution, graduationDate, achievements: [] };
    } else if (hasInstitution && !current) {
      // Institution line before the degree line (some resumes list school first)
      current = { degree: '', institution: line, achievements: [] };
    } else if (hasInstitution && current && !current.institution) {
      current.institution = line;
    } else if (current) {
      // Try to attach subsequent lines to the current entry
      if (!current.institution && line.length < 80 && !/@/.test(line)) {
        current.institution = line;
      } else if (/\b(19|20)\d{2}\b/.test(line) && !current.graduationDate) {
        const yearMatch = line.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) current.graduationDate = yearMatch[0];
      } else if (/\b(gpa|cgpa|cum laude|magna|summa|honors?|distinction|first.class|upper.second|lower.second)\b/i.test(line)) {
        // Extract GPA value into dedicated field if present
        const gpaMatch = line.match(/\b(?:GPA|CGPA)\s*[:\-]?\s*(\d+\.?\d*(?:\s*\/\s*\d+\.?\d*)?)/i);
        if (gpaMatch && !current.gpa) {
          current.gpa = gpaMatch[1].trim();
        }
        current.achievements = current.achievements || [];
        current.achievements.push(line.trim());
      }
    }
  }

  if (current && (current.degree || current.institution)) {
    education.push(current as EducationEntry);
  }

  return education;
}

// Known subsection header patterns within a skills block
const SKILL_SECTION_HEADER_RE = /^(web\s+technologies|back-?end\s+technologies|front-?end\s+technologies|microsoft\s+stack|frameworks?\s+(?:and\s+(?:libraries|tools))?|cloud\s+(?:technologies|services|platforms?)|cloud\s*(?:&|and)\s*devops|tools?\s+(?:and\s+version\s+control)?|development\s+tools?|development\s+practices|technical\s+skills?|programming\s+languages?|languages?\s+(?:and\s+frameworks?)?|databases?\s*(?:and\s+data\s+management)?|data\s+(?:management|storage|tools?|engineering)|devops\s*(?:and\s+deployment)?|deployment\s*(?:and\s+infrastructure)?|other\s+skills?|soft\s+skills?|core\s+competencies|infrastructure|version\s+control|methodologies?|operating\s+systems?|ide\s+(?:and\s+tools?)?|testing\s+(?:and\s+qa)?|mobile\s+(?:development|technologies)?|security(?:\s+tools?)?|networking|apis?\s+(?:and\s+integrations?)?|server\s+management|systems?\s+administration|machine\s+learning|data\s+science|analytics|visualization|reporting|platforms?\s+and\s+tools?|styling\s*(?:&|and)\s*design|performance\s*(?:&|and)\s*optimization|performance\s+optimization):?$/i;

// Detect generic subsection category headers (multi-word plain-text headings with no skill chars)
function isSkillSubsectionHeader(line: string): boolean {
  if (/[,;|•·]/.test(line)) return false;          // Has delimiters → it's a skill list
  if (line.length > 55) return false;               // Long lines are skill rows, not headers
  if (!/^[A-Z]/.test(line)) return false;           // Must start with capital
  const words = line.trim().split(/\s+/);
  if (words.length < 2) return false;               // Single words are standalone skills
  if (/\.[a-zA-Z]/.test(line)) return false;        // Has .ext (Node.js, ASP.NET) → skill
  if (/[+#_()\[\]\/]/.test(line)) return false;     // Has special chars → skill
  // Any word that's a known tech name → treat as a skill line, not a header
  const knownTech = /^(react|angular|vue|node|express|django|flask|rails|spring|laravel|graphql|docker|kubernetes|aws|azure|gcp|git|linux|python|java|typescript|javascript|kotlin|swift|rust|php|ruby|sql|nosql|mongodb|mysql|postgresql|redis|nginx|bootstrap|tailwind|material|redux|nextjs|nestjs|webpack|vite|sass|scss|css|html|bash|powershell|terraform|ansible|jenkins|gradle|maven|agile|scrum|kanban|devops|microservices|serverless|api|rest|sdk|orm|cli|postman|github|docker|kestrel|zustand|shadcn|antd|supabase|prisma|jest|cypress)$/i;
  if (words.some(w => knownTech.test(w))) return false;
  return true; // Looks like "DevOps and Deployment", "Databases and Data Management" etc.
}

// Comprehensive known multi-word skill phrases — sorted longest-first for greedy matching.
// Used when PDF table layouts produce space-separated skill rows (no commas).
// When a phrase contains "&", it also matches the PDF font-encoding variant where
// "&" is decoded as "G" (a common artifact from symbol-font PDFs). This is handled
// in extractSkillsFromSpaceSeparated() via normalized comparison — NOT via string
// replacement — so other PDFs that legitimately use "G" (e.g. "G Suite") are unaffected.
const MULTI_WORD_SKILLS: { phrase: string; tokens: string[] }[] = ([
  // 5-token
  'Webpack Module Federation Architecture',
  // 4-token
  'Production Monitoring & Debugging',
  'Port & Process Management',
  'Ubuntu (Linux) Servers',
  "Let's Encrypt (Certbot)",
  "Let's Encrypt(Certbot)",
  'VPS hosting (Hostinger)',
  'Google Cloud Platform',
  'Amazon Web Services',
  'Microsoft Azure Cloud',
  'React Testing Library',
  'React Hook Form',
  'Test Driven Development',
  'Object Oriented Programming',
  // 3-token
  'Reverse Proxy Configuration',
  'Environment-based Configurations',
  'GitHub Actions Workflows',
  'Webpack Module Federation',
  'Bash/Shell Scripting',
  'ASP.NET Core',
  'CI/CD Pipelines',
  'SQL Server',
  'Azure DevOps',
  'Entity Framework',
  'Visual Studio',
  'Visual Studio Code',
  'Apollo GraphQL',
  'Spring Boot',
  'Spring Framework',
  'Angular Material',
  'Google Cloud',
  'AWS Lambda',
  'AWS S3',
  'AWS EC2',
  'Power BI',
  'Power Apps',
  'Power Automate',
  'Machine Learning',
  'Deep Learning',
  'Data Structures',
  'Design Patterns',
  'Agile Scrum',
  'Agile Methodology',
  'G Suite',
  'Google Workspace',
  'Ubuntu Servers',
  'Linux Servers',
  'NoSQL Databases',
  // 2-token
  'RTK Query',
  'React Query',
  'React Native',
  'React Router',
  'React Hook',
  'Material UI',
  'Tailwind CSS',
  'Ant Design',
  'Schema Migration',
  'Redux Toolkit',
  'Redux Saga',
  'Redux Thunk',
  'Rest API',
  'REST API',
  'Web API',
  'WEB APIs',
  'NET MVC',
  '.NET MVC',
  'VPS hosting',
  'Reverse Proxy',
  'Shell Scripting',
  'GitHub Actions',
  'GitHub Copilot',
  'Apollo Client',
  'Apollo Server',
  'Angular JS',
  'AngularJS',
  'Azure Functions',
  'Azure Storage',
  'Azure Blob',
  'EF Core',
  'Socket IO',
  'Socket.IO',
  'Vue Router',
  'Nuxt JS',
  'NuxtJS',
  'Svelte Kit',
  'SvelteKit',
  'Chakra UI',
  'Next UI',
  'Styled Components',
  'Framer Motion',
  'Three JS',
  'ThreeJS',
  'React Three',
  'Storybook Documentation',
  'Jest Testing',
  'Unit Testing',
  'Integration Testing',
  'End To',
  'CI CD',
  'Dev Tools',
  'VS Code',
  'Agile Scrum',
  'Scrum Master',
  'Product Owner',
  'Data Science',
  'Natural Language',
  'Computer Vision',
  'Reinforcement Learning',
  'Neural Networks',
  'Decision Trees',
  'Random Forest',
] as string[]).map(phrase => ({ phrase, tokens: phrase.split(/\s+/) }))
  .sort((a, b) => b.tokens.length - a.tokens.length || b.phrase.length - a.phrase.length);

// Normalise a string for phrase matching. Handles the common PDF font-encoding
// artifact where "&" is decoded as the letter "G" (from symbol/Wingdings-style fonts).
// Comparison-only — the raw tokens and canonical phrase are never mutated.
function normaliseForMatch(s: string): string {
  return s
    .replace(/\bG\b/g, '&')  // "&" encoded as "G" in some PDFs
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract individual skills from a space-separated row (PDF table/grid layout).
// Uses greedy multi-word matching (longest phrase first) so e.g. "RTK Query" is
// kept as one skill instead of being split into "RTK" + "Query".
// Falls through to individual tokens for anything not in the dictionary — this is
// intentional: splitting an unknown multi-word skill into words is far better than
// silently dropping the whole row (which was the previous behaviour).
function extractSkillsFromSpaceSeparated(line: string): string[] {
  const rawTokens = line.split(/\s+/).filter(t => t.length > 0);
  const result: string[] = [];

  // Tokens to skip when they appear as isolated words (separators, stopwords).
  // "G" is included because pdf-parse sometimes decodes "&" as "G" (symbol font
  // artifact). Legitimate "G"-prefixed skills like "G Suite" are handled via the
  // MULTI_WORD_SKILLS dictionary and matched before the single-token fallback runs.
  const SKIP = /^(and|or|the|a|an|in|on|to|of|is|are|for|with|by|at|&|\+|G)$/;

  let i = 0;
  while (i < rawTokens.length) {
    let matched = false;

    // Try longest phrase first (MULTI_WORD_SKILLS is pre-sorted longest→shortest)
    for (const { phrase, tokens: pt } of MULTI_WORD_SKILLS) {
      if (i + pt.length > rawTokens.length) continue;
      const candidate = rawTokens.slice(i, i + pt.length).join(' ');
      // Compare via normaliseForMatch so "&" and its "G"-encoded variant both match
      if (normaliseForMatch(candidate) === normaliseForMatch(phrase)) {
        result.push(phrase); // always push the canonical phrase form
        i += pt.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      const token = rawTokens[i];
      // Include the token if it is not a stopword / separator and is not a bare number
      if (token.length > 1 && !SKIP.test(token) && !/^\d+$/.test(token)) {
        result.push(token);
      }
      i++;
    }
  }

  return result;
}

// Parse skills
function parseSkills(content: string[]): string[] {
  const skills: string[] = [];

  // Words/phrases to filter out from delimiter-split parts
  const filterWords = /^(and|or|including|such as|like|using|with|for|the|a|an|in|on|to|of|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|must|shall|can|need|dare|ought|used|etc|e\.g\.|i\.e\.)$/i;
  const descriptivePhrases = /(for\s+\w+\s+development|for\s+developing|for\s+building|for\s+managing|for\s+deploying|including\s+|such\s+as\s+)/i;

  // Intro phrases that precede actual skill lists in narrative-style resumes
  // e.g. "Expert in Next.js, React.js" → strip "Expert in " → "Next.js, React.js"
  // e.g. "Proficient in Redux, Zustand" → strip "Proficient in " → "Redux, Zustand"
  const narrativeIntroRE = /^(?:expert\s+in|proficient\s+in|skilled\s+in|experienced\s+in|experienced\s+with|strong\s+expertise\s+in|strong\s+understanding\s+of|knowledge\s+of|advanced\s+knowledge\s+of|deep\s+knowledge\s+of|working\s+knowledge\s+of|familiar\s+with|hands-?on\s+experience\s+(?:in|with)|responsible\s+for(?:\s+building\s+and\s+maintaining)?|specialized\s+in|expertise\s+in)\s+/i;

  for (const line of content) {
    const cleanLine = line.replace(/^[•\-*▪◦›]\s*/, '').trim();
    if (!cleanLine) continue;

    // Skip known subsection category headers
    if (SKILL_SECTION_HEADER_RE.test(cleanLine)) continue;
    if (isSkillSubsectionHeader(cleanLine)) continue;

    // Narrative-intro lines ("Expert in...", "Proficient in...") are descriptive sentences.
    // Trying to comma-split them produces noisy tokens.  The extractSkillsFromText
    // fallback running on the full resume text will pick up the actual tech names
    // mentioned in them, so we safely skip them here.
    if (narrativeIntroRE.test(cleanLine)) continue;

    // Action-verb sentences (e.g. "Implemented dynamic imports...") and any line that
    // reads like a description rather than a skill list — skip them.
    const startsWithActionVerb = /^(?:Led|Built|Developed|Created|Managed|Designed|Implemented|Achieved|Improved|Reduced|Increased|Delivered|Spearheaded|Established|Launched|Drove|Orchestrated|Streamlined|Optimized|Automated|Integrated|Collaborated|Mentored|Trained|Analyzed|Researched|Executed|Coordinated|Enhanced|Architected|Migrated|Refactored|Deployed|Configured|Maintained|Monitored|Debugged|Leveraged|Utilized|Applied|Ensured|Supported|Provided|Enabled|Facilitated)\b/i.test(cleanLine);
    if (startsWithActionVerb) continue;

    // Lines that look like full English sentences (long, ends with period, no commas/semicolons)
    // are narrative descriptions — skip so individual words don't pollute the skills list.
    const hasNoDelimiters = !/[,;|•·]/.test(cleanLine);
    const looksLikeSentence = hasNoDelimiters && cleanLine.length > 40 && (
      cleanLine.endsWith('.') ||
      /\s+(for|to|with|by|through|and)\s+\w+/i.test(cleanLine)
    );
    if (looksLikeSentence) continue;

    // Lines with commas where the first segment itself is a multi-word descriptive
    // phrase are still sentences, just ones that happen to have commas — e.g.
    // "SEO optimization with structured metadata, sitemap automation, and schema markup."
    // Heuristic: if the first comma-segment has > 3 space-separated words it's prose.
    const firstCommaSegment = cleanLine.split(',')[0].trim();
    if (/[,]/.test(cleanLine) && firstCommaSegment.split(/\s+/).length > 3) continue;

    const processedLine = cleanLine.replace(descriptivePhrases, ' ').trim();

    // Detect whether the line uses standard delimiters
    const hasDelimiters = /[,;|•·]/.test(processedLine);

    if (!hasDelimiters) {
      // No comma/pipe/semicolon → likely a PDF table row with space-separated skills
      // Use greedy multi-word skill extraction instead of treating the whole line as one token
      const extracted = extractSkillsFromSpaceSeparated(processedLine);
      for (const s of extracted) {
        if (s.length > 1 && s.length < 80 && !filterWords.test(s)) {
          skills.push(s.replace(/\s+/g, ' '));
        }
      }
      continue;
    }

    // Standard delimiter-based parsing (most non-PDF or well-formatted resumes)
    // Split on commas, semicolons, pipes, bullets; colon only when followed by space
    const parts = processedLine.split(/[,;|•·]|:\s+/);

    for (const part of parts) {
      let skill = part.replace(/^[-*]\s*/, '').trim();
      skill = skill.replace(/^(and|or)\s+/i, '').trim();
      skill = skill.replace(/\s+(for|including|such as|like|using|with).*$/i, '').trim();
      if (!skill) continue;

      // If a delimiter-split part itself contains multiple space-separated words it's
      // either a multi-word skill OR multiple skills joined by space (e.g. from a
      // colon-prefixed category like "Frontend: JavaScript TypeScript React.js").
      // Run it through the same space-separated extractor to handle both cases.
      const wordCount = skill.split(/\s+/).length;
      if (wordCount > 1 && !SKILL_SECTION_HEADER_RE.test(skill) && !isSkillSubsectionHeader(skill)) {
        const extracted = extractSkillsFromSpaceSeparated(skill);
        for (const s of extracted) {
          if (s.length > 1 && s.length < 80 && !filterWords.test(s)) {
            skills.push(s.replace(/\s+/g, ' '));
          }
        }
        continue;
      }

      if (
        skill.length > 1 &&
        skill.length < 60 &&
        !filterWords.test(skill) &&
        !skill.endsWith('.') &&
        !/^\d+$/.test(skill) &&
        !/^(including|such as|like|using)\s/i.test(skill) &&
        !SKILL_SECTION_HEADER_RE.test(skill) &&
        !isSkillSubsectionHeader(skill)
      ) {
        skills.push(skill.replace(/\s+/g, ' '));
      }
    }
  }

  return [...new Set(skills)];
}

// Parse projects - handles both simple projects and work experience style entries
function parseProjects(content: string[]): { name: string; description: string; technologies?: string[]; company?: string; dates?: string; url?: string; role?: string }[] {
  const projects: { name: string; description: string; technologies?: string[]; company?: string; dates?: string; url?: string; role?: string }[] = [];
  let current: { name: string; description: string; technologies?: string[]; company?: string; dates?: string; url?: string; role?: string } | null = null;
  const descriptionLines: string[] = [];

  // Date patterns to detect project/job entries
  const datePattern = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*[-–—]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|Present|Current)|\d{4}\s*[-–—]\s*(?:\d{4}|Present|Current)/i;

  // Lines that are clearly project metadata — never treat as a new project header
  const isMetadataLine = (line: string) =>
    /^(role|industry|responsibilities|client|company|duration|status|team\s+size|type)[\s:]/i.test(line);

  // Lines that signal the start of responsibility bullets — skip them as headers
  const isResponsibilitiesHeader = (line: string) =>
    /^responsibilities:?$/i.test(line.trim());

  const saveCurrentProject = () => {
    if (current) {
      current.description = descriptionLines.join('\n').trim();
      if (current.name || current.description) {
        projects.push(current);
      }
    }
    descriptionLines.length = 0;
  };

  for (let i = 0; i < content.length; i++) {
    const line = content[i];
    const isBulletPoint = /^[•\-*▪◦›]\s*/.test(line);
    const hasDate = datePattern.test(line);
    const hasLink = /github\.com|gitlab\.com|bitbucket\.org|https?:\/\//i.test(line);
    const cleanLine = line.replace(/^[•\-*▪◦›]\s*/, '').trim();

    // Skip "Responsibilities:" label lines — don't treat as new project header
    if (isResponsibilitiesHeader(cleanLine)) continue;

    // Handle metadata lines (Role:, Industry:, etc.)
    if (isMetadataLine(cleanLine) && current) {
      const roleMatch = cleanLine.match(/^role[\s:]+(.+)/i);
      if (roleMatch) {
        current.role = roleMatch[1].replace(/[,;]\s*$/, '').trim();
      }
      // Industry and other metadata — skip as description bullets (metadata, not achievements)
      continue;
    }

    // Tech/tools metadata line
    if (/^(tools?\s*(?:&|and)?\s*technologies?|tech\s+stack|tools?|built\s+with|stack)[\s:]/i.test(cleanLine)) {
      if (current) {
        const techStr = cleanLine.replace(/^(tools?\s*(?:&|and)?\s*technologies?|tech\s+stack|tools?|built\s+with|stack)[\s:]*/i, '');
        current.technologies = techStr
          .split(/[,;|]/)
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }
      continue;
    }

    // URL line — attach as project link
    if (hasLink && !isBulletPoint && cleanLine.length < 120 && current) {
      const linkMatch = cleanLine.match(/https?:\/\/[^\s]+|github\.com\/[^\s]+|gitlab\.com\/[^\s]+/i);
      if (linkMatch) {
        if (!current.url) {
          current.url = linkMatch[0].startsWith('http') ? linkMatch[0] : `https://${linkMatch[0]}`;
        }
        const remainingText = cleanLine.replace(/https?:\/\/[^\s]+|github\.com\/[^\s]+|gitlab\.com\/[^\s]+/gi, '').trim();
        if (remainingText.length > 5) descriptionLines.push(remainingText);
      }
      continue;
    }

    // Determine if this line is a new project header
    // Criteria: not a bullet, not metadata, not too long, and either has a date
    // or is a short capitalised line (likely a project name)
    const isLikelyHeader =
      !isBulletPoint &&
      !isMetadataLine(cleanLine) &&
      cleanLine.length < 80 &&
      cleanLine.length > 2 &&
      /^[A-Z\d]/.test(cleanLine) &&
      // Exclude lines that are clearly description content (action verbs, long sentences)
      !/^(?:Led|Built|Developed|Created|Managed|Designed|Implemented|Achieved|Improved|Reduced|Increased|Delivered|Integrated|Collaborated|Established|Launched|Architected|Proficient|Expert|Skilled|Experienced|Known|Worked|Responsible|Strong|Specialized)\b/i.test(cleanLine);

    if (isLikelyHeader && (hasDate || (cleanLine.length < 60 && !isBulletPoint && current !== null) || current === null)) {
      // Don't start a new project for lines like "Role: ..." we already handled
      saveCurrentProject();

      const dateMatch = cleanLine.match(datePattern);
      const dates = dateMatch ? dateMatch[0] : undefined;
      const nameWithoutDate = dates ? cleanLine.replace(dates, '').trim() : cleanLine;

      let name = nameWithoutDate;
      let company: string | undefined;

      if (/[|–—]/.test(nameWithoutDate)) {
        const parts = nameWithoutDate.split(/[|–—]/);
        name = parts[0].trim();
        company = parts.slice(1).join(' ').trim();
      }

      current = {
        name: name.replace(/^[•\-*▪◦›]\s*/, '').trim(),
        description: '',
        dates,
        company,
      };
    } else if (isBulletPoint && current) {
      if (cleanLine.length > 5) descriptionLines.push(cleanLine);
    } else if (current && cleanLine.length > 10) {
      // Long descriptive line — add to description
      descriptionLines.push(cleanLine);
    } else if (!current && cleanLine.length > 3 && cleanLine.length < 80) {
      // First line before any project detected
      current = { name: cleanLine, description: '' };
    }
  }

  // Don't forget the last project
  saveCurrentProject();

  return projects;
}

// Extract skills from full text as fallback / supplement
function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    // Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Golang', 'Rust',
    'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Dart', 'Elixir',
    // Frontend frameworks/libs
    'React', 'Angular', 'Vue', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby', 'Remix',
    'Redux', 'MobX', 'Zustand', 'Recoil', 'Jotai', 'Valtio',
    'React Query', 'RTK Query', 'SWR', 'Apollo Client',
    'Webpack', 'Vite', 'Parcel', 'Rollup', 'Esbuild', 'Turbopack',
    'Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI', 'Ant Design',
    'ShadCN', 'Radix UI', 'Headless UI', 'Styled Components', 'Emotion',
    'Framer Motion', 'GSAP', 'Three.js',
    'SASS', 'SCSS', 'Less', 'CSS', 'HTML',
    // Backend frameworks
    'Node.js', 'Express', 'Nest.js', 'Fastify', 'Hapi', 'Koa',
    'Django', 'Flask', 'FastAPI', 'SQLAlchemy',
    'Spring', 'Spring Boot', 'Spring MVC', 'Hibernate',
    'Laravel', 'Symfony', 'CodeIgniter',
    'Rails', 'Sinatra',
    'ASP.NET', 'ASP.NET Core', '.NET', '.NET Core', 'Entity Framework',
    'GraphQL', 'REST', 'gRPC', 'WebSockets', 'Socket.IO',
    // Databases
    'PostgreSQL', 'MySQL', 'SQLite', 'SQL Server', 'Oracle',
    'MongoDB', 'Redis', 'Cassandra', 'DynamoDB', 'CouchDB', 'Firebase',
    'Elasticsearch', 'Neo4j', 'InfluxDB', 'TimescaleDB',
    'Prisma', 'TypeORM', 'Sequelize', 'Mongoose',
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Google Cloud', 'Heroku', 'Vercel', 'Netlify', 'DigitalOcean',
    'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Pulumi',
    'CI/CD', 'GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI', 'Travis CI',
    'Azure DevOps', 'ArgoCD', 'Helm',
    'NGINX', 'Apache', 'Caddy', 'Traefik',
    'Linux', 'Ubuntu', 'Bash', 'Shell',
    // Testing
    'Jest', 'Vitest', 'Cypress', 'Playwright', 'Selenium', 'Testing Library',
    'Mocha', 'Chai', 'Jasmine', 'Karma', 'Supertest',
    // Tools
    'Git', 'GitHub', 'GitLab', 'Bitbucket',
    'Jira', 'Confluence', 'Notion', 'Slack',
    'Postman', 'Insomnia', 'Swagger',
    'VS Code', 'IntelliJ', 'WebStorm', 'PyCharm',
    'Figma', 'Storybook',
    // Methodologies
    'Agile', 'Scrum', 'Kanban', 'TDD', 'BDD', 'DDD', 'Microservices', 'Serverless',
    // Data / ML
    'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy',
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
    'Tableau', 'Power BI', 'Grafana', 'Kibana',
    // Mobile
    'React Native', 'Flutter', 'Expo', 'Ionic', 'Capacitor',
    // Other
    'OAuth', 'JWT', 'SAML', 'SSO', 'LDAP', 'Active Directory',
    'WebAssembly', 'PWA', 'Electron', 'Tauri',
    'Stripe', 'Twilio', 'SendGrid',
  ];

  const found: string[] = [];
  const textLower = text.toLowerCase();

  for (const skill of commonSkills) {
    // Match as whole word (handle special chars in skill names)
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![\\w.])${escaped}(?![\\w.])`, 'i');
    if (regex.test(textLower)) {
      found.push(skill);
    }
  }

  return found;
}

// Log parsing error
export async function logParsingError(
  fileName: string,
  fileType: string,
  error: Error,
  resumeId?: string,
  userId?: string
): Promise<void> {
  await prisma.parsingErrorLog.create({
    data: {
      resumeId,
      userId,
      fileName,
      fileType,
      errorMessage: error.message,
      errorStack: error.stack,
    },
  });
}
