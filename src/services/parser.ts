import mammoth from 'mammoth';

// pdf-parse has quirky exports, use require
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');
import { prisma } from '../utils/prisma';
import { ParsedResumeData, ExperienceEntry, EducationEntry, ContactInfo } from '../types';
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
  const data = await pdfParse(buffer);
  return cleanText(data.text);
}

// Parse DOCX file
async function parseDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return cleanText(result.value);
}

// Clean and normalize text
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\t+/g, ' ')
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
    contact: extractContactInfo(lines),
  };

  // Extract skills from full text
  data.skills = extractSkillsFromText(rawText);

  return data;
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

// Process section content
function processSection(
  data: ParsedResumeData,
  section: string,
  content: string[]
): void {
  switch (section) {
    case 'summary':
      data.summary = content.join(' ').trim();
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
      data.certifications = content.filter(l => l.length > 3);
      break;
    case 'projects':
      data.projects = parseProjects(content);
      break;
  }
}

// Parse experience entries
function parseExperience(content: string[]): ExperienceEntry[] {
  const experiences: ExperienceEntry[] = [];
  let current: Partial<ExperienceEntry> | null = null;

  // Multiple date patterns to catch various formats
  const datePatterns = [
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*[-–—]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|Present|Current)/i,
    /\d{1,2}\/\d{4}\s*[-–—]\s*(?:\d{1,2}\/\d{4}|Present|Current)/i,
    /\d{4}\s*[-–—]\s*(?:\d{4}|Present|Current)/i,
  ];

  const jobTitlePatterns = [
    /\b(Engineer|Developer|Manager|Director|Lead|Senior|Junior|Analyst|Designer|Architect|Consultant|Specialist|Coordinator|Administrator|Intern)\b/i,
  ];

  for (let i = 0; i < content.length; i++) {
    const line = content[i];

    // Check if line contains dates
    let dateMatch = null;
    for (const pattern of datePatterns) {
      dateMatch = line.match(pattern);
      if (dateMatch) break;
    }

    const hasJobTitle = jobTitlePatterns.some(p => p.test(line));
    const isBulletPoint = /^[•\-*▪◦›]\s*/.test(line) || /^(?:Led|Built|Developed|Created|Managed|Designed|Implemented|Achieved|Improved|Reduced|Increased)\b/i.test(line);

    if (dateMatch) {
      // Line with date - could be a new entry or date line for current entry
      if (current && current.title && !current.startDate) {
        // Add date to current entry
        const dates = dateMatch[0].split(/[-–—]/);
        current.startDate = dates[0]?.trim();
        current.endDate = dates[1]?.trim();
        current.current = /present|current/i.test(dates[1] || '');
      } else {
        // Save previous entry and start new one
        if (current && current.title) {
          experiences.push(current as ExperienceEntry);
        }
        const dates = dateMatch[0].split(/[-–—]/);
        const titlePart = line.replace(dateMatch[0], '').trim();
        current = {
          title: titlePart || '',
          company: '',
          startDate: dates[0]?.trim(),
          endDate: dates[1]?.trim(),
          current: /present|current/i.test(dates[1] || ''),
          description: [],
        };
      }
    } else if (hasJobTitle && !isBulletPoint && line.length < 80) {
      // Likely a job title line
      if (current && current.title) {
        experiences.push(current as ExperienceEntry);
      }
      current = {
        title: line,
        company: '',
        description: [],
      };
    } else if (isBulletPoint && current) {
      // Bullet point description
      current.description = current.description || [];
      const cleanLine = line.replace(/^[•\-*▪◦›]\s*/, '').trim();
      if (cleanLine.length > 5) {
        current.description.push(cleanLine);
      }
    } else if (current && !current.company && line.length < 80 && line.length > 3) {
      // Could be company name or location
      if (/[-–|,]/.test(line)) {
        const parts = line.split(/[-–|,]/);
        current.company = parts[0]?.trim() || line;
        if (parts[1]) {
          current.location = parts.slice(1).join(',').trim();
        }
      } else {
        current.company = line;
      }
    } else if (current && line.length > 20 && !isBulletPoint) {
      // Long line without bullet - might be description
      current.description = current.description || [];
      current.description.push(line);
    }
  }

  if (current && current.title) {
    experiences.push(current as ExperienceEntry);
  }

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

  for (const line of content) {
    // Split by common delimiters
    const parts = line.split(/[,;|•·]/);
    for (const part of parts) {
      const skill = part.replace(/^[-*]\s*/, '').trim();
      if (skill.length > 1 && skill.length < 50) {
        skills.push(skill);
      }
    }
  }

  return [...new Set(skills)]; // Remove duplicates
}

// Parse projects
function parseProjects(content: string[]): { name: string; description: string; technologies?: string[] }[] {
  const projects: { name: string; description: string; technologies?: string[] }[] = [];
  let current: { name: string; description: string; technologies?: string[] } | null = null;

  for (const line of content) {
    if (!line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && line.length < 60) {
      if (current) {
        projects.push(current);
      }
      current = { name: line, description: '' };
    } else if (current) {
      const cleanLine = line.replace(/^[•\-*]\s*/, '');
      if (/technologies?:|tech:|tools?:|built with/i.test(cleanLine)) {
        current.technologies = cleanLine.replace(/technologies?:|tech:|tools?:|built with/i, '').split(/[,;]/).map(s => s.trim());
      } else {
        current.description += (current.description ? ' ' : '') + cleanLine;
      }
    }
  }

  if (current) {
    projects.push(current);
  }

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
