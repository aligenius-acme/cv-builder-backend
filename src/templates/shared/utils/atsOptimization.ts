/**
 * ATS optimization utilities
 * Ensures resume content is ATS-friendly and parseable
 */

/**
 * Remove special characters that may confuse ATS
 */
export function sanitizeForATS(text: string): string {
  return text
    // Keep only basic punctuation
    .replace(/[^\w\s.,;:()\-'/&@#+]/g, ' ')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Convert Unicode bullets to standard hyphens
 */
export function normalizeUnicodeBullets(text: string): string {
  return text.replace(/[•●○◦▪▫■□‣⁃]/g, '-');
}

/**
 * Ensure section headers are ATS-recognizable
 */
export const atsRecognizedHeaders: Record<string, string[]> = {
  experience: [
    'Work Experience',
    'Professional Experience',
    'Employment History',
    'Experience',
  ],
  education: [
    'Education',
    'Academic Background',
    'Educational Background',
  ],
  skills: [
    'Skills',
    'Technical Skills',
    'Core Competencies',
  ],
  certifications: [
    'Certifications',
    'Licenses & Certifications',
    'Professional Certifications',
  ],
  projects: [
    'Projects',
    'Key Projects',
    'Notable Projects',
  ],
  summary: [
    'Professional Summary',
    'Summary',
    'Profile',
    'Executive Summary',
  ],
};

/**
 * Get ATS-friendly header name
 */
export function getATSHeader(section: keyof typeof atsRecognizedHeaders): string {
  return atsRecognizedHeaders[section]?.[0] || section;
}

/**
 * Check if text contains ATS-risky elements
 */
export interface ATSRisk {
  type: 'tables' | 'images' | 'graphics' | 'columns' | 'headers_footers' | 'text_boxes';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

/**
 * Analyze text for ATS compatibility
 */
export function analyzeATSCompatibility(text: string): {
  score: number;
  risks: ATSRisk[];
  recommendations: string[];
} {
  const risks: ATSRisk[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check for complex Unicode
  const hasComplexUnicode = /[^\u0000-\u007F]/.test(text);
  if (hasComplexUnicode) {
    score -= 5;
    recommendations.push('Replace special Unicode characters with standard ASCII equivalents');
  }

  // Check for multiple spaces (might indicate table formatting)
  const hasMultipleSpaces = /\s{3,}/.test(text);
  if (hasMultipleSpaces) {
    score -= 10;
    risks.push({
      type: 'tables',
      severity: 'medium',
      description: 'Multiple spaces detected - may indicate table-based layout',
    });
    recommendations.push('Avoid using tables or multiple spaces for formatting');
  }

  // Check for very long lines (might wrap poorly in ATS)
  const lines = text.split('\n');
  const hasLongLines = lines.some(line => line.length > 100);
  if (hasLongLines) {
    score -= 5;
    recommendations.push('Keep lines under 100 characters for better ATS parsing');
  }

  // Check for proper section headers
  const hasSections = Object.values(atsRecognizedHeaders).some(headers =>
    headers.some(header => text.includes(header))
  );
  if (!hasSections) {
    score -= 20;
    recommendations.push('Use standard section headers (Experience, Education, Skills, etc.)');
  }

  // Check for dates in recognizable format
  const hasStandardDates = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b/i.test(text);
  if (!hasStandardDates && /\d{4}/.test(text)) {
    score -= 5;
    recommendations.push('Use standard date formats (e.g., "Jan 2020" or "January 2020")');
  }

  return {
    score: Math.max(0, score),
    risks,
    recommendations,
  };
}

/**
 * Extract keywords for ATS matching
 */
export function extractKeywords(text: string): string[] {
  const keywords: Set<string> = new Set();

  // Common technical skills
  const techPatterns = [
    /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|PHP|Go|Rust|Swift|Kotlin)\b/gi,
    /\b(React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|Rails)\b/gi,
    /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|Linux)\b/gi,
    /\b(SQL|NoSQL|PostgreSQL|MySQL|MongoDB|Redis)\b/gi,
    /\b(API|REST|GraphQL|Microservices|DevOps|CI\/CD|Agile|Scrum)\b/gi,
  ];

  // Common soft skills
  const softSkillPatterns = [
    /\b(leadership|management|communication|collaboration|problem-solving)\b/gi,
    /\b(analytical|strategic|creative|innovative|detail-oriented)\b/gi,
  ];

  // Extract technical keywords
  techPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => keywords.add(match));
  });

  // Extract soft skills
  softSkillPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => keywords.add(match.toLowerCase()));
  });

  // Extract job titles
  const titlePatterns = [
    /\b(Engineer|Developer|Manager|Director|Analyst|Designer|Architect|Lead|Senior)\b/gi,
  ];

  titlePatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => keywords.add(match));
  });

  return Array.from(keywords);
}

/**
 * Calculate keyword density
 */
export function calculateKeywordDensity(
  text: string,
  keywords: string[]
): Record<string, number> {
  const textLower = text.toLowerCase();
  const density: Record<string, number> = {};

  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const regex = new RegExp(`\\b${keywordLower}\\b`, 'gi');
    const matches = textLower.match(regex) || [];
    density[keyword] = matches.length;
  });

  return density;
}

/**
 * Optimize bullet points for ATS
 */
export function optimizeBulletPoint(text: string): string {
  let optimized = text;

  // Ensure it starts with an action verb
  const actionVerbs = [
    'Led', 'Developed', 'Managed', 'Created', 'Implemented', 'Designed',
    'Improved', 'Increased', 'Reduced', 'Achieved', 'Built', 'Launched',
    'Drove', 'Established', 'Streamlined', 'Optimized', 'Automated',
  ];

  const startsWithAction = actionVerbs.some(verb =>
    new RegExp(`^${verb}\\b`, 'i').test(optimized.trim())
  );

  if (!startsWithAction) {
    // Try to identify the first verb and move it to the front
    const firstVerb = actionVerbs.find(verb =>
      new RegExp(`\\b${verb}\\b`, 'i').test(optimized)
    );

    if (firstVerb) {
      optimized = optimized.replace(
        new RegExp(`\\b${firstVerb}\\b`, 'i'),
        ''
      ).trim();
      optimized = `${firstVerb} ${optimized}`;
    }
  }

  // Remove bullet character if present
  optimized = optimized.replace(/^[•\-*▪◦›●○]\s*/, '');

  // Ensure proper capitalization
  optimized = optimized.charAt(0).toUpperCase() + optimized.slice(1);

  // Remove trailing period if present (some ATS prefer without)
  optimized = optimized.replace(/\.$/, '');

  return optimized;
}

/**
 * Check if text is ATS-safe (no special formatting)
 */
export function isATSSafe(text: string): boolean {
  // Check for problematic characters
  const hasProblematicChars = /[|│┃║▌▐█▄▀]/.test(text);
  if (hasProblematicChars) return false;

  // Check for excessive special characters
  const specialCharCount = (text.match(/[^a-zA-Z0-9\s.,;:()\-'/&@#+]/g) || []).length;
  const specialCharRatio = specialCharCount / text.length;
  if (specialCharRatio > 0.1) return false; // More than 10% special chars

  return true;
}

/**
 * Convert rich text to ATS-friendly plain text
 */
export function toATSPlainText(text: string): string {
  return text
    // Remove HTML tags if any
    .replace(/<[^>]*>/g, '')
    // Normalize bullets
    .replace(/[•●○◦▪▫■□‣⁃]/g, '- ')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove special formatting characters
    .replace(/[│┃║▌▐█▄▀]/g, '')
    .trim();
}

/**
 * Generate ATS-optimized version of resume text
 */
export function optimizeForATS(text: string): string {
  // Convert to plain text
  let optimized = toATSPlainText(text);

  // Normalize Unicode
  optimized = normalizeUnicodeBullets(optimized);

  // Sanitize
  optimized = sanitizeForATS(optimized);

  return optimized;
}

/**
 * Validate email format (ATS-friendly)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (ATS-friendly)
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's a valid length (10-11 digits)
  return cleaned.length >= 10 && cleaned.length <= 11;
}

/**
 * Get ATS score for text content
 */
export function getATSScore(text: string): number {
  const analysis = analyzeATSCompatibility(text);
  return analysis.score;
}
