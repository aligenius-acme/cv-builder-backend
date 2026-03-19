import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { prisma } from '../utils/prisma';
import { ParsedResumeData, ExperienceEntry, EducationEntry, ContactInfo, CertificationEntry, AwardEntry } from '../types';
import { FileProcessingError } from '../utils/errors';

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
async function parseDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return cleanText(result.value);
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

// Extract structured data from raw resume text using rule-based parsing
// This does a quick parse for display - full text is stored and used during customization
export async function extractResumeData(rawText: string): Promise<ParsedResumeData> {
  return extractResumeDataRuleBased(rawText);
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
    { pattern: /^(professional\s+)?summary:?$|^profile:?$|^about(\s+me)?:?$|^objective:?$|^career\s+(objective|summary):?$|^experience\s+summary:?$|^summary\s+of\s+(experience|qualifications):?$|^executive\s+summary:?$|^personal\s+statement:?$|^introduction:?$|^professional\s+profile:?$|^work\s+summary:?$|^overview:?$/i, section: 'summary' },
    // Experience
    { pattern: /^work\s+experience:?$|^employment(\s+history)?:?$|^work\s+history:?$|^professional\s+experience:?$|^career\s+history:?$|^relevant\s+experience:?$|^job\s+history:?$|^experience:?$|^positions?\s+held:?$|^professional\s+background:?$|^technical\s+experience:?$|^industry\s+experience:?$/i, section: 'experience' },
    // Education
    { pattern: /^education(al)?(\s+background)?:?$|^academic(\s+background)?:?$|^qualifications:?$|^academic\s+credentials:?$|^schooling:?$|^degrees?:?$|^academic\s+history:?$|^educational\s+qualifications:?$/i, section: 'education' },
    // Skills
    { pattern: /^(technical\s+)?skills:?$|^core\s+competencies:?$|^competencies:?$|^expertise:?$|^technologies:?$|^areas?\s+of\s+expertise:?$|^key\s+skills:?$|^skills?\s+(summary|set):?$|^proficiencies:?$|^abilities:?$|^technical\s+proficiencies:?$|^technical\s+expertise:?$|^tools?\s+and\s+technologies:?$|^tech\s+stack:?$|^technology\s+stack:?$/i, section: 'skills' },
    // Certifications
    { pattern: /^certifications?:?$|^licenses?(\s+(&|and)\s+certifications?)?:?$|^professional\s+certifications?:?$|^credentials:?$|^professional\s+development:?$|^training:?$|^courses?:?$|^certificate(s)?:?$|^accreditations?:?$/i, section: 'certifications' },
    // Projects
    { pattern: /^projects?:?$|^personal\s+projects?:?$|^key\s+projects?:?$|^notable\s+projects?:?$|^side\s+projects?:?$|^portfolio:?$|^selected\s+projects?:?$|^freelance\s+projects?:?$|^open\s+source:?$/i, section: 'projects' },
    // Languages
    { pattern: /^languages?:?$|^language\s+skills?:?$|^language\s+proficiency:?$|^foreign\s+languages?:?$|^spoken\s+languages?:?$/i, section: 'languages' },
    // Awards
    { pattern: /^awards?:?$|^honors?(\s+(&|and)\s+awards?)?:?$|^achievements?:?$|^recognition:?$|^accomplishments?:?$|^distinctions?:?$|^scholarships?:?$/i, section: 'awards' },
    // Extra sections
    { pattern: /^publications?:?$|^research:?$|^papers?:?$|^conference\s+papers?:?$/i, section: 'projects' },
    { pattern: /^volunteer(ing)?(\s+experience)?:?$|^community\s+(service|involvement):?$|^extracurricular:?$/i, section: 'experience' },
    { pattern: /^interests?:?$|^hobbies?:?$|^activities?:?$/i, section: 'interests' },
    { pattern: /^references?:?$/i, section: 'references' },
  ];

  // Identify sections and their content
  const sections: { section: string; startIndex: number; endIndex: number; headerLine: string }[] = [];
  const usedLineIndices = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Clean line for matching - remove trailing colons, dashes, etc.
    const cleanLine = line.replace(/[:\-–—]+$/, '').trim();

    // Check if line is a section header
    // Headers are usually: short, ALL CAPS, title case, or end with colon
    const isLikelyHeader = (
      cleanLine.length < 60 &&
      (cleanLine.length < 40 || cleanLine === cleanLine.toUpperCase() || line.endsWith(':'))
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
  const contactEndIndex = Math.min(10, lines.length);

  for (let i = contactEndIndex; i < lines.length; i++) {
    if (!usedLineIndices.has(i)) {
      unassignedLines.push(lines[i]);
    }
  }

  // If we have unassigned content and no summary, use it as summary
  if (!data.summary && unassignedLines.length > 0) {
    // Filter out lines that look like job titles or dates
    const summaryLines = unassignedLines.filter(line => {
      const hasDate = /\b(19|20)\d{2}\b/.test(line) || /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(line);
      const isShortTitle = line.length < 50 && /\b(Engineer|Developer|Manager|Director)\b/i.test(line);
      return !hasDate && !isShortTitle && line.length > 20;
    });

    if (summaryLines.length > 0 && summaryLines.length <= 10) {
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

  // Fallback: If no experience found via sections, try to extract from full text
  if (data.experience.length === 0) {
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
  const certKeywords = /\b(certified|certification|certificate|license|licensed|credential|AWS|Azure|GCP|PMP|CISSP|CompTIA|Cisco|Oracle|Microsoft|Google|Salesforce|Scrum|Agile|CPA|CFA|Series\s+\d+)\b/i;

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
  // Search first 15 lines — some resume templates put more header content than expected
  const headerText = lines.slice(0, 15).join(' ');

  // Name: first line that doesn't look like contact info or a job title subtitle
  for (const line of lines.slice(0, 6)) {
    const cleaned = line.replace(/^[•\-*▪◦›]\s*/, '').trim();
    if (
      cleaned.length > 1 &&
      cleaned.length < 70 &&
      !/@/.test(cleaned) &&
      !/https?:\/\//i.test(cleaned) &&
      !/\d{3}.*\d{3}/.test(cleaned) &&      // not a phone
      !/^(engineer|developer|designer|manager|analyst|consultant|architect|director|lead|senior|junior|full.stack|front.end|back.end|software|product|data|devops)/i.test(cleaned)
    ) {
      contact.name = cleaned;
      break;
    }
  }

  // Email
  const emailMatch = headerText.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (emailMatch) contact.email = emailMatch[0];

  // Phone — handles international (+XX), US, and common formats
  const phoneMatch = headerText.match(
    /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{1,3}[-.\s]\d{1,4}[-.\s]\d{1,4}[-.\s]?\d{1,9}/
  );
  if (phoneMatch) contact.phone = phoneMatch[0].trim();

  // LinkedIn — handle URL variants and common OCR/typo issues
  // Matches: linkedin.com/in/x, lnkd.in/x, linke...in.com/in/x (typos)
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

  // Location — handle "City, ST", "City, ST ZIP", "City, Country"
  const locationMatch = headerText.match(
    /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?),\s*(?:[A-Z]{2}(?:\s+\d{5})?|[A-Z][a-zA-Z]{2,})\b/
  );
  if (locationMatch) contact.location = locationMatch[0];

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
      // Projects might contain work experience entries - parse and also check for experience
      const projects = parseProjects(content);
      data.projects = projects;
      // If projects look like work experience (have dates), also add to experience
      const projectExperience = parseExperience(content);
      if (projectExperience.length > 0 && data.experience.length === 0) {
        data.experience = projectExperience;
      }
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

    // Extract year if present
    const dateMatch = trimmed.match(/\b(19|20)\d{2}\b/);
    if (dateMatch) {
      cert.date = dateMatch[0];
      cert.name = trimmed.replace(dateMatch[0], '').trim().replace(/\s{2,}/g, ' ');
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

  // Multiple date patterns to catch various formats
  const datePatterns = [
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*'?\d{2,4}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*'?\d{2,4}|Present|Current|Now|Ongoing)/i,
    /\d{1,2}\/\d{2,4}\s*[-–—to]+\s*(?:\d{1,2}\/\d{2,4}|Present|Current|Now)/i,
    /\d{4}\s*[-–—to]+\s*(?:\d{4}|Present|Current|Now|Ongoing)/i,
  ];

  const jobTitlePatterns = [
    /\b(Engineer|Developer|Manager|Director|Lead|Senior|Junior|Analyst|Designer|Architect|Consultant|Specialist|Coordinator|Administrator|Intern|Associate|Officer|Executive|VP|CTO|CEO|CFO|COO|Head)\b/i,
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

    const hasJobTitle = jobTitlePatterns.some(p => p.test(line));
    const isBulletPoint = /^[•\-*▪◦›●○]\s*/.test(line);
    const startsWithActionVerb = /^(?:Led|Built|Developed|Created|Managed|Designed|Implemented|Achieved|Improved|Reduced|Increased|Delivered|Spearheaded|Established|Launched|Drove|Orchestrated|Streamlined|Optimized|Automated|Integrated|Collaborated|Mentored|Trained|Analyzed|Researched|Executed|Coordinated)\b/i.test(line);

    if (dateMatch) {
      // Line with date - likely a new entry or contains date for current entry
      const dates = dateMatch[0].split(/[-–—]|to/i).map(d => d.trim());
      const titlePart = line.replace(dateMatch[0], '').trim().replace(/^[|,\-–—]\s*/, '').trim();

      if (current && current.title && !current.startDate) {
        // Add date to current entry
        current.startDate = dates[0];
        current.endDate = dates[1] || dates[0];
        current.current = /present|current|now|ongoing/i.test(dates[1] || '');
      } else {
        // Save previous entry and start new one
        saveExperience();
        current = {
          title: titlePart || '',
          company: '',
          startDate: dates[0],
          endDate: dates[1] || dates[0],
          current: /present|current|now|ongoing/i.test(dates[1] || ''),
          description: [],
        };
      }
    } else if (hasJobTitle && !isBulletPoint && !startsWithActionVerb && line.length < 100) {
      // Likely a job title line - save previous and start new
      saveExperience();

      // Check if line contains company info (often separated by | or at or -)
      let title = line;
      let company = '';
      let location = '';

      if (/\s+at\s+/i.test(line)) {
        const parts = line.split(/\s+at\s+/i);
        title = parts[0].trim();
        company = parts[1]?.trim() || '';
      } else if (/[|]/.test(line)) {
        const parts = line.split('|');
        title = parts[0].trim();
        company = parts[1]?.trim() || '';
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

  for (const line of content) {
    const degreePatterns = [
      /\b(Bachelor|Master|Ph\.?D|Doctor|Associate|B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|B\.?Sc|M\.?Sc)\b/i,
    ];

    const hasDegree = degreePatterns.some(p => p.test(line));

    if (hasDegree) {
      if (current && current.degree) {
        education.push(current as EducationEntry);
      }
      current = {
        degree: line,
        institution: '',
        achievements: [],
      };
    } else if (current) {
      if (!current.institution && line.length < 60) {
        current.institution = line;
      } else if (/\d{4}/.test(line)) {
        const yearMatch = line.match(/\d{4}/);
        if (yearMatch) {
          current.graduationDate = yearMatch[0];
        }
      } else if (/gpa|cum laude|magna|summa|honors/i.test(line)) {
        current.achievements = current.achievements || [];
        current.achievements.push(line);
      }
    }
  }

  if (current && current.degree) {
    education.push(current as EducationEntry);
  }

  return education;
}

// Known subsection header patterns within a skills block
const SKILL_SECTION_HEADER_RE = /^(web\s+technologies|back-?end\s+technologies|front-?end\s+technologies|microsoft\s+stack|frameworks?\s+(?:and\s+(?:libraries|tools))?|cloud\s+(?:technologies|services|platforms?)|tools?\s+(?:and\s+version\s+control)?|development\s+practices|technical\s+skills?|programming\s+languages?|languages?\s+(?:and\s+frameworks?)?|databases?\s*(?:and\s+data\s+management)?|data\s+(?:management|storage|tools?|engineering)|devops\s*(?:and\s+deployment)?|deployment\s*(?:and\s+infrastructure)?|other\s+skills?|soft\s+skills?|core\s+competencies|infrastructure|version\s+control|methodologies?|operating\s+systems?|ide\s+(?:and\s+tools?)?|testing\s+(?:and\s+qa)?|mobile\s+(?:development|technologies)?|security(?:\s+tools?)?|networking|apis?\s+(?:and\s+integrations?)?|server\s+management|systems?\s+administration|machine\s+learning|data\s+science|analytics|visualization|reporting|platforms?\s+and\s+tools?):?$/i;

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

  for (const line of content) {
    const cleanLine = line.replace(/^[•\-*▪◦›]\s*/, '').trim();
    if (!cleanLine) continue;

    // Skip known subsection category headers
    if (SKILL_SECTION_HEADER_RE.test(cleanLine)) continue;
    if (isSkillSubsectionHeader(cleanLine)) continue;

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
function parseProjects(content: string[]): { name: string; description: string; technologies?: string[]; company?: string; dates?: string; link?: string }[] {
  const projects: { name: string; description: string; technologies?: string[]; company?: string; dates?: string; link?: string }[] = [];
  let current: { name: string; description: string; technologies?: string[]; company?: string; dates?: string; link?: string } | null = null;
  const descriptionLines: string[] = [];

  // Date patterns to detect project/job entries
  const datePattern = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*[-–—]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|Present|Current)|\d{4}\s*[-–—]\s*(?:\d{4}|Present|Current)/i;

  const saveCurrentProject = () => {
    if (current) {
      // Join description lines with newlines to preserve bullet points
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

    // Check if this looks like a new project/entry header
    // Headers are typically: short, not bullet points, might have dates, or company names
    const isLikelyHeader = !isBulletPoint && line.length < 100 && (
      hasDate ||
      /^[A-Z]/.test(line) && line.length < 80 ||
      /\b(Project|Client|Company|Role|Position)\b/i.test(line)
    );

    if (isLikelyHeader && (hasDate || (line.length < 60 && !isBulletPoint))) {
      // Save previous project and start new one
      saveCurrentProject();

      // Extract date if present
      const dateMatch = line.match(datePattern);
      const dates = dateMatch ? dateMatch[0] : undefined;
      const nameWithoutDate = dates ? line.replace(dates, '').trim() : line;

      // Check if line contains company info (often after | or -)
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
    } else if (current) {
      // This is content for the current project
      const cleanLine = line.replace(/^[•\-*▪◦›]\s*/, '').trim();

      if (/technologies?:|tech stack:|tools?:|built with|stack:/i.test(cleanLine)) {
        current.technologies = cleanLine
          .replace(/technologies?:|tech stack:|tools?:|built with|stack:/i, '')
          .split(/[,;|]/)
          .map(s => s.trim())
          .filter(s => s.length > 0);
      } else if (hasLink) {
        const linkMatch = cleanLine.match(/https?:\/\/[^\s]+|github\.com\/[^\s]+|gitlab\.com\/[^\s]+/i);
        if (linkMatch) {
          current.link = linkMatch[0].startsWith('http') ? linkMatch[0] : `https://${linkMatch[0]}`;
        }
        // Also add to description if there's more content
        const remainingText = cleanLine.replace(/https?:\/\/[^\s]+|github\.com\/[^\s]+|gitlab\.com\/[^\s]+/gi, '').trim();
        if (remainingText.length > 5) {
          descriptionLines.push(remainingText);
        }
      } else if (cleanLine.length > 3) {
        // Always add bullet point formatting
        descriptionLines.push(cleanLine);
      }
    } else {
      // No current project yet, might be the first entry
      const cleanLine = line.replace(/^[•\-*▪◦›]\s*/, '').trim();
      if (cleanLine.length > 3 && cleanLine.length < 80) {
        current = { name: cleanLine, description: '' };
      }
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
