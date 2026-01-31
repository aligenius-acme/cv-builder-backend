/**
 * Formatting utilities for resume data
 * Handles dates, text, phone numbers, and other data formatting
 */

/**
 * Format date string to consistent format
 */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';

  // Handle "Present", "Current", etc.
  if (/present|current|now|ongoing/i.test(dateStr)) {
    return 'Present';
  }

  // Try to parse the date
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }

  // Return as-is if unable to parse
  return dateStr;
}

/**
 * Format date range
 */
export function formatDateRange(
  startDate?: string,
  endDate?: string,
  isCurrent?: boolean
): string {
  const start = formatDate(startDate);
  const end = isCurrent ? 'Present' : formatDate(endDate);

  if (!start && !end) return '';
  if (!start) return end;
  if (!end) return start;

  return `${start} - ${end}`;
}

/**
 * Calculate duration between dates
 */
export function calculateDuration(
  startDate?: string,
  endDate?: string,
  isCurrent?: boolean
): string {
  if (!startDate) return '';

  const start = new Date(startDate);
  const end = isCurrent || !endDate ? new Date() : new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return '';
  }

  const months = (end.getFullYear() - start.getFullYear()) * 12 +
                 (end.getMonth() - start.getMonth());

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return remainingMonths === 1 ? '1 month' : `${remainingMonths} months`;
  }

  if (remainingMonths === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  }

  const yearStr = years === 1 ? '1 year' : `${years} years`;
  const monthStr = remainingMonths === 1 ? '1 month' : `${remainingMonths} months`;

  return `${yearStr}, ${monthStr}`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone?: string): string {
  if (!phone) return '';

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 10) {
    // US format: (123) 456-7890
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    // US format with country code: +1 (123) 456-7890
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Return original if format is unrecognized
  return phone;
}

/**
 * Format URL for display (remove protocol)
 */
export function formatUrlForDisplay(url?: string): string {
  if (!url) return '';

  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}

/**
 * Ensure URL has protocol
 */
export function ensureUrlProtocol(url?: string): string {
  if (!url) return '';

  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }

  return url;
}

/**
 * Extract domain from email
 */
export function extractEmailDomain(email?: string): string {
  if (!email) return '';

  const parts = email.split('@');
  return parts.length === 2 ? parts[1] : '';
}

/**
 * Format location string
 */
export function formatLocation(location?: string): string {
  if (!location) return '';

  // Clean up extra whitespace
  return location.trim().replace(/\s+/g, ' ');
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text?: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Clean bullet point text
 */
export function cleanBulletPoint(text: string): string {
  return text
    .replace(/^[•\-*▪◦›●○]\s*/, '')
    .trim();
}

/**
 * Ensure bullet point has consistent formatting
 */
export function ensureBulletPoint(text: string, bulletChar: string = '•'): string {
  const cleaned = cleanBulletPoint(text);
  return cleaned ? `${bulletChar} ${cleaned}` : '';
}

/**
 * Format list of items with separator
 */
export function formatList(
  items: string[],
  separator: string = ', ',
  lastSeparator?: string
): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];

  if (lastSeparator && items.length > 1) {
    const allButLast = items.slice(0, -1);
    const last = items[items.length - 1];
    return allButLast.join(separator) + lastSeparator + last;
  }

  return items.join(separator);
}

/**
 * Extract initials from name
 */
export function getInitials(name?: string): string {
  if (!name) return '';

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format GPA
 */
export function formatGPA(gpa?: string): string {
  if (!gpa) return '';

  // If already formatted, return as-is
  if (/GPA:/i.test(gpa)) return gpa;

  // Add GPA label if just a number
  const gpaNum = parseFloat(gpa);
  if (!isNaN(gpaNum)) {
    return `GPA: ${gpaNum.toFixed(2)}`;
  }

  return gpa;
}

/**
 * Clean and normalize whitespace
 */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Remove empty lines
 */
export function removeEmptyLines(text: string): string {
  return text
    .split('\n')
    .filter(line => line.trim().length > 0)
    .join('\n');
}

/**
 * Split text into lines with max length
 */
export function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxLength) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Estimate reading time in minutes
 */
export function estimateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = countWords(text);
  return Math.ceil(words / wordsPerMinute);
}
