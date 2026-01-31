/**
 * Typography utilities for PDF templates
 * Provides font definitions, sizes, and text styling helpers
 */

export interface FontSizes {
  xs: number;
  sm: number;
  base: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
}

export interface FontWeights {
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
}

export const fontSizes: FontSizes = {
  xs: 8,
  sm: 9,
  base: 10,
  lg: 11,
  xl: 12,
  '2xl': 14,
  '3xl': 16,
  '4xl': 20,
};

export const fontWeights: FontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const fontFamilies = {
  sans: 'Helvetica',
  serif: 'Times-Roman',
  mono: 'Courier',
} as const;

export type FontFamily = typeof fontFamilies[keyof typeof fontFamilies];

/**
 * Get font size based on key
 */
export function getFontSize(size: keyof FontSizes): number {
  return fontSizes[size];
}

/**
 * Get font weight
 */
export function getFontWeight(weight: keyof FontWeights): number {
  return fontWeights[weight];
}

/**
 * Line height calculator
 */
export function getLineHeight(fontSize: number, multiplier: number = 1.5): number {
  return fontSize * multiplier;
}

/**
 * Text styling interface for components
 */
export interface TextStyle {
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: FontFamily;
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
}

/**
 * Common text style presets
 */
export const textStyles = {
  h1: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: getLineHeight(fontSizes['4xl'], 1.2),
  },
  h2: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: getLineHeight(fontSizes['3xl'], 1.3),
  },
  h3: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: getLineHeight(fontSizes['2xl'], 1.3),
  },
  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: getLineHeight(fontSizes.xl, 1.4),
  },
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: getLineHeight(fontSizes.base, 1.5),
  },
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: getLineHeight(fontSizes.lg, 1.5),
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: getLineHeight(fontSizes.sm, 1.5),
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: getLineHeight(fontSizes.xs, 1.4),
  },
  subtitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: getLineHeight(fontSizes.lg, 1.4),
  },
} as const;

/**
 * Apply text truncation (for use with width constraints)
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Convert text transform
 */
export function applyTextTransform(
  text: string,
  transform: TextStyle['textTransform']
): string {
  if (!transform || transform === 'none') return text;

  switch (transform) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'capitalize':
      return text.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    default:
      return text;
  }
}
