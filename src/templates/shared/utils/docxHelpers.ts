/**
 * DOCX Helper Utilities for ATS-Compatible Resume Generation
 *
 * Provides utilities for creating ATS-optimized Word documents using the docx library
 * Focuses on standard fonts, proper hierarchy, and clean formatting
 */

import {
  TextRun,
  Paragraph,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  UnderlineType,
  SectionType,
  PageBreak,
  TabStopType,
  TabStopPosition,
} from 'docx';

// Type definitions
type ISpacingProperties = {
  before?: number;
  after?: number;
  line?: number;
  lineRule?: 'auto' | 'atLeast' | 'exact';
};

type IParagraphOptions = any;
type IRunOptions = any;

// ============================================================================
// CONSTANTS - ATS-Safe Standards
// ============================================================================

/**
 * Standard ATS-compatible fonts
 * These fonts are universally recognized by ATS systems
 */
export const ATS_SAFE_FONTS = {
  ARIAL: 'Arial',
  CALIBRI: 'Calibri',
  TIMES_NEW_ROMAN: 'Times New Roman',
  GEORGIA: 'Georgia',
  HELVETICA: 'Helvetica',
  VERDANA: 'Verdana',
} as const;

/**
 * Standard font sizes (in half-points, docx uses half-points)
 * Example: 11pt = 22 half-points
 */
export const FONT_SIZES = {
  SMALL: 18,        // 9pt
  BODY: 20,         // 10pt
  BODY_LARGE: 22,   // 11pt
  SUBHEADER: 24,    // 12pt
  HEADER: 28,       // 14pt
  LARGE: 32,        // 16pt
  XLARGE: 36,       // 18pt
} as const;

/**
 * Standard bullet characters for ATS compatibility
 */
export const BULLET_STYLES = {
  ROUND: '•',
  SQUARE: '▪',
  DASH: '–',
  ARROW: '›',
  CIRCLE: '○',
} as const;

// ============================================================================
// SPACING UTILITIES
// ============================================================================

/**
 * Convert points to twips (1/20 of a point)
 * DOCX uses twips for spacing measurements
 */
export function pointsToTwips(points: number): number {
  return Math.round(points * 20);
}

/**
 * Convert pixels to DXA (1/20 of a point)
 * Used for width measurements
 */
export function pixelsToDxa(pixels: number): number {
  return Math.round(pixels * 15);
}

/**
 * Standard spacing presets in twips
 */
export const SPACING = {
  NONE: 0,
  TIGHT: pointsToTwips(3),       // 60 twips
  SMALL: pointsToTwips(6),       // 120 twips
  MEDIUM: pointsToTwips(12),     // 240 twips
  LARGE: pointsToTwips(18),      // 360 twips
  XLARGE: pointsToTwips(24),     // 480 twips
  SECTION: pointsToTwips(16),    // 320 twips - between sections
  PARAGRAPH: pointsToTwips(8),   // 160 twips - between paragraphs
  LINE: pointsToTwips(4),        // 80 twips - between lines
} as const;

/**
 * Create spacing configuration for paragraphs
 */
export function createSpacing(options: {
  before?: number;
  after?: number;
  line?: number;
  lineRule?: 'auto' | 'atLeast' | 'exact';
}): ISpacingProperties {
  return {
    before: options.before ?? 0,
    after: options.after ?? 0,
    line: options.line,
    lineRule: options.lineRule,
  };
}

// ============================================================================
// TEXT STYLING HELPERS
// ============================================================================

/**
 * Create a text run with standard ATS-safe styling
 */
export function createTextRun(
  text: string,
  options?: {
    bold?: boolean;
    italic?: boolean;
    color?: string;
    size?: number;
    font?: string;
    underline?: any;
    allCaps?: boolean;
    smallCaps?: boolean;
  }
): TextRun {
  return new TextRun({
    text,
    bold: options?.bold ?? false,
    italics: options?.italic ?? false,
    color: options?.color?.replace('#', '') ?? '000000',
    size: options?.size ?? FONT_SIZES.BODY,
    font: options?.font ?? ATS_SAFE_FONTS.CALIBRI,
    underline: options?.underline,
    allCaps: options?.allCaps ?? false,
    smallCaps: options?.smallCaps ?? false,
  });
}

/**
 * Create a bold text run
 */
export function boldText(text: string, size?: number, color?: string): TextRun {
  return createTextRun(text, { bold: true, size, color });
}

/**
 * Create an italic text run
 */
export function italicText(text: string, size?: number, color?: string): TextRun {
  return createTextRun(text, { italic: true, size, color });
}

/**
 * Create colored text run
 */
export function coloredText(text: string, color: string, size?: number): TextRun {
  return createTextRun(text, { color, size });
}

// ============================================================================
// PARAGRAPH HELPERS
// ============================================================================

/**
 * Create a standard paragraph with common options
 */
export function createParagraph(
  children: TextRun[],
  options?: {
    alignment?: any;
    spacing?: ISpacingProperties;
    heading?: any;
    indent?: { left?: number; right?: number; firstLine?: number; hanging?: number };
    border?: { bottom?: boolean; top?: boolean; color?: string };
    keepNext?: boolean;
    keepLines?: boolean;
  }
): Paragraph {
  const paragraphOptions: any = {
    children,
    alignment: options?.alignment,
    spacing: options?.spacing,
    heading: options?.heading,
    indent: options?.indent ? {
      left: options.indent.left,
      right: options.indent.right,
      firstLine: options.indent.firstLine,
      hanging: options.indent.hanging,
    } : undefined,
    keepNext: options?.keepNext,
    keepLines: options?.keepLines,
  };

  // Add borders if specified
  if (options?.border) {
    const borderConfig: any = {};
    if (options.border.bottom) {
      borderConfig.bottom = {
        color: options.border.color?.replace('#', '') ?? '000000',
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      };
    }
    if (options.border.top) {
      borderConfig.top = {
        color: options.border.color?.replace('#', '') ?? '000000',
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      };
    }
    paragraphOptions.border = borderConfig;
  }

  return new Paragraph(paragraphOptions);
}

/**
 * Create an empty paragraph for spacing
 */
export function emptyParagraph(spacing?: ISpacingProperties): Paragraph {
  return new Paragraph({
    children: [new TextRun('')],
    spacing: spacing ?? createSpacing({ after: SPACING.SMALL }),
  });
}

// ============================================================================
// HEADING HELPERS
// ============================================================================

/**
 * Create H1 heading (candidate name)
 */
export function createH1(
  text: string,
  options?: {
    color?: string;
    alignment?: any;
    size?: number;
    font?: string;
  }
): Paragraph {
  return createParagraph(
    [createTextRun(text, {
      bold: true,
      size: options?.size ?? FONT_SIZES.XLARGE,
      color: options?.color,
      font: options?.font ?? ATS_SAFE_FONTS.CALIBRI,
    })],
    {
      heading: HeadingLevel.HEADING_1,
      alignment: options?.alignment ?? AlignmentType.LEFT,
      spacing: createSpacing({ after: SPACING.SMALL }),
      keepNext: true,
    }
  );
}

/**
 * Create H2 heading (section headers)
 */
export function createH2(
  text: string,
  options?: {
    color?: string;
    underline?: boolean;
    uppercase?: boolean;
    size?: number;
    font?: string;
  }
): Paragraph {
  const displayText = options?.uppercase ? text.toUpperCase() : text;

  return createParagraph(
    [createTextRun(displayText, {
      bold: true,
      size: options?.size ?? FONT_SIZES.SUBHEADER,
      color: options?.color,
      font: options?.font ?? ATS_SAFE_FONTS.CALIBRI,
      allCaps: options?.uppercase,
    })],
    {
      heading: HeadingLevel.HEADING_2,
      spacing: createSpacing({ before: SPACING.MEDIUM, after: SPACING.SMALL }),
      border: options?.underline ? { bottom: true, color: options.color } : undefined,
      keepNext: true,
      keepLines: true,
    }
  );
}

/**
 * Create H3 heading (job titles, education degrees)
 */
export function createH3(
  text: string,
  options?: {
    color?: string;
    size?: number;
    font?: string;
  }
): Paragraph {
  return createParagraph(
    [createTextRun(text, {
      bold: true,
      size: options?.size ?? FONT_SIZES.BODY_LARGE,
      color: options?.color,
      font: options?.font ?? ATS_SAFE_FONTS.CALIBRI,
    })],
    {
      heading: HeadingLevel.HEADING_3,
      spacing: createSpacing({ before: SPACING.SMALL, after: SPACING.TIGHT }),
      keepNext: true,
    }
  );
}

// ============================================================================
// BULLET LIST HELPERS
// ============================================================================

/**
 * Create a bullet point paragraph
 */
export function createBulletPoint(
  text: string,
  options?: {
    bullet?: string;
    indentLevel?: number;
    size?: number;
    color?: string;
    font?: string;
  }
): Paragraph {
  const bullet = options?.bullet ?? BULLET_STYLES.ROUND;
  const indentLeft = pointsToTwips(20 + (options?.indentLevel ?? 0) * 20);
  const hangingIndent = pointsToTwips(15);

  return createParagraph(
    [createTextRun(`${bullet}\t${text}`, {
      size: options?.size ?? FONT_SIZES.BODY,
      color: options?.color,
      font: options?.font ?? ATS_SAFE_FONTS.CALIBRI,
    })],
    {
      spacing: createSpacing({ after: SPACING.LINE }),
      indent: {
        left: indentLeft,
        hanging: hangingIndent,
      },
    }
  );
}

/**
 * Create multiple bullet points
 */
export function createBulletList(
  items: string[],
  options?: {
    bullet?: string;
    indentLevel?: number;
    size?: number;
    color?: string;
    font?: string;
  }
): Paragraph[] {
  return items.map(item => createBulletPoint(item, options));
}

// ============================================================================
// SECTION GENERATORS
// ============================================================================

/**
 * Create contact information section
 */
export function createContactSection(
  name: string,
  contactDetails: string[],
  options?: {
    nameColor?: string;
    alignment?: any;
    font?: string;
  }
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Name
  paragraphs.push(createH1(name, {
    color: options?.nameColor,
    alignment: options?.alignment ?? AlignmentType.LEFT,
    font: options?.font,
  }));

  // Contact details on one line
  if (contactDetails.length > 0) {
    const contactText = contactDetails.join('  |  ');
    paragraphs.push(createParagraph(
      [createTextRun(contactText, {
        size: FONT_SIZES.BODY,
        color: '666666',
        font: options?.font ?? ATS_SAFE_FONTS.CALIBRI,
      })],
      {
        alignment: options?.alignment ?? AlignmentType.LEFT,
        spacing: createSpacing({ after: SPACING.MEDIUM }),
      }
    ));
  }

  return paragraphs;
}

/**
 * Create a standard section with header
 */
export function createSection(
  title: string,
  content: Paragraph[],
  options?: {
    titleColor?: string;
    uppercase?: boolean;
    underline?: boolean;
    font?: string;
  }
): Paragraph[] {
  return [
    createH2(title, {
      color: options?.titleColor,
      uppercase: options?.uppercase ?? true,
      underline: options?.underline ?? true,
      font: options?.font,
    }),
    ...content,
  ];
}

/**
 * Create experience entry
 */
export function createExperienceEntry(
  title: string,
  company: string,
  location: string | undefined,
  dates: string,
  bullets: string[],
  options?: {
    titleColor?: string;
    font?: string;
  }
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Job title
  paragraphs.push(createH3(title, {
    color: options?.titleColor,
    font: options?.font,
  }));

  // Company and dates
  const companyLine = location ? `${company}, ${location}` : company;
  paragraphs.push(createParagraph(
    [
      createTextRun(companyLine, {
        size: FONT_SIZES.BODY,
        font: options?.font ?? ATS_SAFE_FONTS.CALIBRI,
      }),
      createTextRun('  |  ', {
        size: FONT_SIZES.BODY,
        color: 'CCCCCC',
        font: options?.font ?? ATS_SAFE_FONTS.CALIBRI,
      }),
      createTextRun(dates, {
        size: FONT_SIZES.BODY,
        italic: true,
        color: '666666',
        font: options?.font ?? ATS_SAFE_FONTS.CALIBRI,
      }),
    ],
    {
      spacing: createSpacing({ after: SPACING.TIGHT }),
    }
  ));

  // Bullet points
  if (bullets.length > 0) {
    paragraphs.push(...createBulletList(bullets, {
      font: options?.font,
    }));

    // Add spacing after last bullet
    paragraphs.push(emptyParagraph(createSpacing({ after: SPACING.SMALL })));
  }

  return paragraphs;
}

/**
 * Create education entry
 */
export function createEducationEntry(
  degree: string,
  institution: string,
  graduationDate: string | undefined,
  options?: {
    titleColor?: string;
    font?: string;
  }
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Degree
  paragraphs.push(createH3(degree, {
    color: options?.titleColor,
    font: options?.font,
  }));

  // Institution and date
  const institutionParts: TextRun[] = [
    createTextRun(institution, {
      size: FONT_SIZES.BODY,
      font: options?.font ?? ATS_SAFE_FONTS.CALIBRI,
    }),
  ];

  if (graduationDate) {
    institutionParts.push(
      createTextRun('  |  ', {
        size: FONT_SIZES.BODY,
        color: 'CCCCCC',
        font: options?.font ?? ATS_SAFE_FONTS.CALIBRI,
      }),
      createTextRun(graduationDate, {
        size: FONT_SIZES.BODY,
        italic: true,
        color: '666666',
        font: options?.font ?? ATS_SAFE_FONTS.CALIBRI,
      })
    );
  }

  paragraphs.push(createParagraph(institutionParts, {
    spacing: createSpacing({ after: SPACING.SMALL }),
  }));

  return paragraphs;
}

/**
 * Create skills section (inline comma-separated)
 */
export function createSkillsSection(
  skills: string[],
  options?: {
    font?: string;
  }
): Paragraph {
  const skillsText = skills.join(', ');

  return createParagraph(
    [createTextRun(skillsText, {
      size: FONT_SIZES.BODY,
      font: options?.font ?? ATS_SAFE_FONTS.CALIBRI,
    })],
    {
      spacing: createSpacing({ after: SPACING.MEDIUM }),
    }
  );
}

/**
 * Create summary/profile section
 */
export function createSummarySection(
  summaryText: string,
  options?: {
    font?: string;
    alignment?: any;
  }
): Paragraph {
  return createParagraph(
    [createTextRun(summaryText, {
      size: FONT_SIZES.BODY,
      font: options?.font ?? ATS_SAFE_FONTS.CALIBRI,
    })],
    {
      alignment: options?.alignment ?? AlignmentType.LEFT,
      spacing: createSpacing({ after: SPACING.MEDIUM, line: 276 }), // 1.15 line spacing
    }
  );
}

// ============================================================================
// PAGE BREAK HELPERS
// ============================================================================

/**
 * Create a page break
 */
export function createPageBreak(): Paragraph {
  return new Paragraph({
    children: [new PageBreak()],
  });
}

/**
 * Create a section break (for different page layouts)
 */
export function createSectionBreak(type: any = SectionType.NEXT_PAGE): Paragraph {
  return new Paragraph({
    children: [new TextRun('')],
    pageBreakBefore: true,
  });
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Ensure color is in correct format (no # prefix)
 */
export function formatColor(color: string): string {
  return color.replace('#', '').toUpperCase();
}

/**
 * Convert hex color to RGB for Word
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Clean bullet point text (remove existing bullets)
 */
export function cleanBulletText(text: string): string {
  return text.replace(/^[•\-*▪◦›●○]\s*/, '').trim();
}

/**
 * Validate and sanitize text for Word
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '') // Remove control characters
    .trim();
}

/**
 * Truncate text to maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
