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
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t+/g, ' ')
    .split('\n');

  const filtered = lines.filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return true; // keep blank lines for now (collapsed below)

    // Page numbers: "1", "- 1 of 3 -", "-- 1 of 3 --", "2 of 5", "Page 2", "Page 2 of 5", "- 3 -", "3 | 5"
    if (/^-?\s*\d+\s*-?$/.test(trimmed)) return false;
    if (/^page\s+\d+(\s+of\s+\d+)?$/i.test(trimmed)) return false;
    if (/^-*\s*\d+\s+of\s+\d+\s*-*$/.test(trimmed)) return false;
    if (/^\d+\s*[|\/]\s*\d+$/.test(trimmed)) return false;

    // Confidential / draft watermarks often appear as single short lines
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
    // Summary patterns (must check before experience to catch "Experience Summary")
    { pattern: /^(professional\s+)?summary:?$|^profile:?$|^about(\s+me)?:?$|^objective:?$|^career\s+(objective|summary):?$|^experience\s+summary:?$|^summary\s+of\s+(experience|qualifications):?$|^executive\s+summary:?$|^personal\s+statement:?$|^introduction:?$/i, section: 'summary' },
    // Experience patterns (work history with jobs)
    { pattern: /^work\s+experience:?$|^employment(\s+history)?:?$|^work\s+history:?$|^professional\s+experience:?$|^career\s+history:?$|^relevant\s+experience:?$|^job\s+history:?$|^experience:?$|^positions?\s+held:?$/i, section: 'experience' },
    // Education patterns
    { pattern: /^education(al)?(\s+background)?:?$|^academic(\s+background)?:?$|^qualifications:?$|^academic\s+credentials:?$|^schooling:?$|^degrees?:?$/i, section: 'education' },
    // Skills patterns
    { pattern: /^(technical\s+)?skills:?$|^core\s+competencies:?$|^competencies:?$|^expertise:?$|^technologies:?$|^areas?\s+of\s+expertise:?$|^key\s+skills:?$|^skills?\s+(summary|set):?$|^proficiencies:?$|^abilities:?$|^technical\s+proficiencies:?$/i, section: 'skills' },
    // Certifications patterns
    { pattern: /^certifications?:?$|^licenses?(\s+(&|and)\s+certifications?)?:?$|^professional\s+certifications?:?$|^credentials:?$|^professional\s+development:?$|^training:?$|^courses?:?$/i, section: 'certifications' },
    // Projects patterns
    { pattern: /^projects?:?$|^personal\s+projects?:?$|^key\s+projects?:?$|^notable\s+projects?:?$|^side\s+projects?:?$|^portfolio:?$|^selected\s+projects?:?$/i, section: 'projects' },
    // Languages patterns
    { pattern: /^languages?:?$|^language\s+skills?:?$|^language\s+proficiency:?$|^foreign\s+languages?:?$/i, section: 'languages' },
    // Awards patterns
    { pattern: /^awards?:?$|^honors?(\s+(&|and)\s+awards?)?:?$|^achievements?:?$|^recognition:?$|^accomplishments?:?$|^distinctions?:?$/i, section: 'awards' },
    // Additional sections
    { pattern: /^publications?:?$|^research:?$|^papers?:?$/i, section: 'projects' },
    { pattern: /^volunteer(ing)?(\s+experience)?:?$|^community\s+(service|involvement):?$/i, section: 'experience' },
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

  // Fallback: Extract skills from full text if none found via sections
  if (data.skills.length === 0) {
    data.skills = extractSkillsFromText(rawText);
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
  const text = lines.slice(0, 10).join(' '); // Usually contact info is at the top

  // Name (assume first non-empty line that's not an email/phone)
  for (const line of lines.slice(0, 5)) {
    if (!/@/.test(line) && !/\d{3}.*\d{3}/.test(line) && line.length < 50) {
      contact.name = line;
      break;
    }
  }

  // Email
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (emailMatch) {
    contact.email = emailMatch[0];
  }

  // Phone
  const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    contact.phone = phoneMatch[0];
  }

  // LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) {
    contact.linkedin = `https://${linkedinMatch[0]}`;
  }

  // GitHub
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  if (githubMatch) {
    contact.github = `https://${githubMatch[0]}`;
  }

  // Location (city, state pattern)
  const locationMatch = text.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*([A-Z]{2})/);
  if (locationMatch) {
    contact.location = locationMatch[0];
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

  for (const line of content) {
    if (line.length < 5) continue;

    const cert: CertificationEntry = { name: line };

    // Try to extract date
    const dateMatch = line.match(/\b(19|20)\d{2}\b/);
    if (dateMatch) {
      cert.date = dateMatch[0];
      cert.name = line.replace(dateMatch[0], '').trim();
    }

    // Try to extract issuer (often after a dash or comma)
    const parts = cert.name.split(/[-–—,]/);
    if (parts.length > 1) {
      cert.name = parts[0].trim();
      cert.issuer = parts.slice(1).join(',').trim();
    }

    if (cert.name.length > 3) {
      certifications.push(cert);
    }
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

// Parse skills
function parseSkills(content: string[]): string[] {
  const skills: string[] = [];

  // Words/phrases to filter out
  const filterWords = /^(and|or|including|such as|like|using|with|for|the|a|an|in|on|to|of|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|must|shall|can|need|dare|ought|used|etc|e\.g\.|i\.e\.)$/i;
  const descriptivePhrases = /(for\s+\w+\s+development|for\s+developing|for\s+building|for\s+managing|for\s+deploying|including\s+|such\s+as\s+)/i;

  // Section headers to skip
  const sectionHeaders = /^(web\s+technologies|back-?end\s+technologies|front-?end\s+technologies|microsoft\s+stack|frameworks?\s+and\s+libraries|cloud\s+technologies|tools?\s+and\s+version\s+control|development\s+practices|technical\s+skills?|programming\s+languages?|databases?|devops|other\s+skills?):?$/i;

  for (const line of content) {
    // Skip section headers
    const cleanLine = line.replace(/^[•\-*▪◦›]\s*/, '').trim();
    if (sectionHeaders.test(cleanLine)) {
      continue;
    }

    // Remove descriptive phrases
    let processedLine = cleanLine.replace(descriptivePhrases, ' ');

    // Split by common delimiters
    const parts = processedLine.split(/[,;|•·:]/);

    for (const part of parts) {
      let skill = part.replace(/^[-*]\s*/, '').trim();

      // Remove leading "and", "or", etc.
      skill = skill.replace(/^(and|or)\s+/i, '').trim();

      // Remove trailing descriptive text
      skill = skill.replace(/\s+(for|including|such as|like|using|with).*$/i, '').trim();

      // Skip if it's a filter word, too short, too long, or ends with a period (likely a sentence)
      if (
        skill.length > 1 &&
        skill.length < 40 &&
        !filterWords.test(skill) &&
        !skill.endsWith('.') &&
        !/^\d+$/.test(skill) && // Skip pure numbers
        !/^(including|such as|like|using)\s/i.test(skill)
      ) {
        // Clean up common patterns
        skill = skill.replace(/\s+/g, ' '); // Normalize whitespace
        skills.push(skill);
      }
    }
  }

  return [...new Set(skills)]; // Remove duplicates
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

// Extract skills from full text as fallback
function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    // Programming languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
    // Frameworks
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Rails',
    'Next.js', 'Nest.js', '.NET', 'Laravel',
    // Databases
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server',
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Terraform',
    // Tools
    'Git', 'Linux', 'Agile', 'Scrum', 'Jira', 'REST', 'GraphQL', 'API',
  ];

  const found: string[] = [];
  const textLower = text.toLowerCase();

  for (const skill of commonSkills) {
    if (textLower.includes(skill.toLowerCase())) {
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
