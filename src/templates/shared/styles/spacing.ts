/**
 * Spacing utilities for PDF templates
 * Provides consistent spacing, margins, and padding constants
 */

export interface SpacingScale {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  8: number;
  10: number;
  12: number;
  16: number;
  20: number;
  24: number;
  32: number;
  40: number;
  48: number;
  56: number;
  64: number;
}

/**
 * Base spacing scale (in points for PDF)
 */
export const spacing: SpacingScale = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10,
  6: 12,
  8: 16,
  10: 20,
  12: 24,
  16: 32,
  20: 40,
  24: 48,
  32: 64,
  40: 80,
  48: 96,
  56: 112,
  64: 128,
};

/**
 * Common margin configurations
 */
export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const pageMargins = {
  narrow: {
    top: 36,    // 0.5 inch
    right: 36,
    bottom: 36,
    left: 36,
  },
  normal: {
    top: 54,    // 0.75 inch
    right: 54,
    bottom: 54,
    left: 54,
  },
  moderate: {
    top: 72,    // 1 inch
    right: 54,
    bottom: 72,
    left: 54,
  },
  wide: {
    top: 72,    // 1 inch
    right: 72,
    bottom: 72,
    left: 72,
  },
} as const;

/**
 * Section spacing presets
 */
export const sectionSpacing = {
  header: spacing[8],        // Space after header
  sectionGap: spacing[12],   // Gap between major sections
  entryGap: spacing[6],      // Gap between entries within a section
  itemGap: spacing[3],       // Gap between items in a list
  paragraphGap: spacing[4],  // Gap between paragraphs
  bulletIndent: spacing[5],  // Indent for bullet points
} as const;

/**
 * Get spacing value by key
 */
export function getSpacing(key: keyof SpacingScale): number {
  return spacing[key];
}

/**
 * Get margin values for a preset
 */
export function getPageMargins(preset: keyof typeof pageMargins): PageMargins {
  return pageMargins[preset];
}

/**
 * Create custom margins
 */
export function createCustomMargins(
  all?: number,
  vertical?: number,
  horizontal?: number,
  top?: number,
  right?: number,
  bottom?: number,
  left?: number
): PageMargins {
  if (all !== undefined) {
    return { top: all, right: all, bottom: all, left: all };
  }

  if (vertical !== undefined || horizontal !== undefined) {
    return {
      top: vertical ?? 54,
      right: horizontal ?? 54,
      bottom: vertical ?? 54,
      left: horizontal ?? 54,
    };
  }

  return {
    top: top ?? 54,
    right: right ?? 54,
    bottom: bottom ?? 54,
    left: left ?? 54,
  };
}

/**
 * Calculate available width given page width and margins
 */
export function getContentWidth(pageWidth: number, margins: PageMargins): number {
  return pageWidth - margins.left - margins.right;
}

/**
 * Calculate available height given page height and margins
 */
export function getContentHeight(pageHeight: number, margins: PageMargins): number {
  return pageHeight - margins.top - margins.bottom;
}

/**
 * Standard page sizes in points (1 inch = 72 points)
 */
export const pageSizes = {
  letter: {
    width: 612,   // 8.5 inches
    height: 792,  // 11 inches
  },
  a4: {
    width: 595,   // 210mm
    height: 842,  // 297mm
  },
  legal: {
    width: 612,   // 8.5 inches
    height: 1008, // 14 inches
  },
} as const;

/**
 * Get page size
 */
export function getPageSize(size: keyof typeof pageSizes = 'letter') {
  return pageSizes[size];
}

/**
 * Two-column layout calculations
 */
export interface TwoColumnLayout {
  leftColumnWidth: number;
  rightColumnWidth: number;
  columnGap: number;
}

/**
 * Calculate two-column layout dimensions
 */
export function calculateTwoColumnLayout(
  contentWidth: number,
  leftWidthPercent: number = 35,
  columnGap: number = spacing[8]
): TwoColumnLayout {
  const leftColumnWidth = (contentWidth * leftWidthPercent) / 100;
  const rightColumnWidth = contentWidth - leftColumnWidth - columnGap;

  return {
    leftColumnWidth,
    rightColumnWidth,
    columnGap,
  };
}

/**
 * Grid layout calculations
 */
export interface GridLayout {
  columnCount: number;
  columnWidth: number;
  gutterWidth: number;
}

/**
 * Calculate grid layout dimensions
 */
export function calculateGridLayout(
  contentWidth: number,
  columnCount: number,
  gutterWidth: number = spacing[4]
): GridLayout {
  const totalGutterWidth = gutterWidth * (columnCount - 1);
  const columnWidth = (contentWidth - totalGutterWidth) / columnCount;

  return {
    columnCount,
    columnWidth,
    gutterWidth,
  };
}

/**
 * Calculate vertical rhythm (baseline grid)
 */
export function getBaselineGrid(baseLineHeight: number): {
  lineHeight: number;
  rhythm: (multiplier: number) => number;
} {
  return {
    lineHeight: baseLineHeight,
    rhythm: (multiplier: number) => baseLineHeight * multiplier,
  };
}
