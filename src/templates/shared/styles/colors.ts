/**
 * Color palette utilities for PDF templates
 * Provides color definitions, palette generation, and color helpers
 */

export interface ColorPalette {
  name?: string;           // Color scheme name
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textLight: string;
  textMuted: string;
  background: string;
  backgroundAlt: string;
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  error: string;
  // Optional extended fields
  primaryDark?: string;
  surface?: string;
  heading?: string;
  body?: string;
}

/**
 * Default color palettes for different template themes
 */
export const colorPalettes: Record<string, ColorPalette> = {
  professional: {
    primary: '#2563eb',      // Blue
    secondary: '#475569',    // Slate gray
    accent: '#0ea5e9',       // Sky blue
    text: '#0f172a',         // Almost black
    textLight: '#334155',    // Dark gray
    textMuted: '#64748b',    // Medium gray
    background: '#ffffff',   // White
    backgroundAlt: '#f8fafc', // Very light gray
    border: '#cbd5e1',       // Light gray
    borderLight: '#e2e8f0',  // Very light gray
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
  },
  creative: {
    primary: '#8b5cf6',      // Purple
    secondary: '#ec4899',    // Pink
    accent: '#f59e0b',       // Amber
    text: '#1f2937',         // Dark gray
    textLight: '#4b5563',    // Medium gray
    textMuted: '#6b7280',    // Light gray
    background: '#ffffff',   // White
    backgroundAlt: '#faf5ff', // Very light purple
    border: '#d8b4fe',       // Light purple
    borderLight: '#e9d5ff',  // Very light purple
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
  },
  minimal: {
    primary: '#000000',      // Black
    secondary: '#404040',    // Dark gray
    accent: '#737373',       // Medium gray
    text: '#0a0a0a',         // Almost black
    textLight: '#404040',    // Dark gray
    textMuted: '#737373',    // Medium gray
    background: '#ffffff',   // White
    backgroundAlt: '#fafafa', // Very light gray
    border: '#d4d4d4',       // Light gray
    borderLight: '#e5e5e5',  // Very light gray
    success: '#22c55e',      // Green
    warning: '#eab308',      // Yellow
    error: '#ef4444',        // Red
  },
  modern: {
    primary: '#06b6d4',      // Cyan
    secondary: '#0891b2',    // Dark cyan
    accent: '#14b8a6',       // Teal
    text: '#0f172a',         // Almost black
    textLight: '#1e293b',    // Dark slate
    textMuted: '#475569',    // Medium slate
    background: '#ffffff',   // White
    backgroundAlt: '#f0fdfa', // Very light teal
    border: '#5eead4',       // Light teal
    borderLight: '#99f6e4',  // Very light teal
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
  },
  executive: {
    primary: '#1e40af',      // Dark blue
    secondary: '#1e3a8a',    // Darker blue
    accent: '#3730a3',       // Indigo
    text: '#111827',         // Almost black
    textLight: '#1f2937',    // Dark gray
    textMuted: '#4b5563',    // Medium gray
    background: '#ffffff',   // White
    backgroundAlt: '#eff6ff', // Very light blue
    border: '#93c5fd',       // Light blue
    borderLight: '#bfdbfe',  // Very light blue
    success: '#059669',      // Dark green
    warning: '#d97706',      // Dark amber
    error: '#dc2626',        // Dark red
  },
  // ============================================================================
  // VARIATION PALETTES - For Template Expansion (500+ Templates)
  // ============================================================================
  navy: {
    primary: '#1e3a8a',      // Navy blue
    secondary: '#3b82f6',    // Blue
    accent: '#60a5fa',       // Light blue
    text: '#1e293b',         // Slate
    textLight: '#475569',    // Medium slate
    textMuted: '#64748b',    // Light slate
    background: '#ffffff',   // White
    backgroundAlt: '#f0f9ff', // Very light blue
    border: '#bfdbfe',       // Light blue
    borderLight: '#dbeafe',  // Very light blue
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
  },
  emerald: {
    primary: '#047857',      // Emerald
    secondary: '#10b981',    // Green
    accent: '#6ee7b7',       // Light green
    text: '#1e293b',         // Slate
    textLight: '#475569',    // Medium slate
    textMuted: '#64748b',    // Light slate
    background: '#ffffff',   // White
    backgroundAlt: '#f0fdf4', // Very light green
    border: '#a7f3d0',       // Light green
    borderLight: '#d1fae5',  // Very light green
    success: '#059669',      // Dark green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
  },
  burgundy: {
    primary: '#881337',      // Burgundy
    secondary: '#be123c',    // Rose
    accent: '#fb7185',       // Pink
    text: '#1e293b',         // Slate
    textLight: '#475569',    // Medium slate
    textMuted: '#64748b',    // Light slate
    background: '#ffffff',   // White
    backgroundAlt: '#fff1f2', // Very light rose
    border: '#fda4af',       // Light pink
    borderLight: '#fecdd3',  // Very light pink
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Amber
    error: '#dc2626',        // Dark red
  },
  slate: {
    primary: '#334155',      // Slate
    secondary: '#64748b',    // Medium slate
    accent: '#94a3b8',       // Light slate
    text: '#1e293b',         // Dark slate
    textLight: '#475569',    // Medium slate
    textMuted: '#64748b',    // Light slate
    background: '#ffffff',   // White
    backgroundAlt: '#f8fafc', // Very light gray
    border: '#cbd5e1',       // Light gray
    borderLight: '#e2e8f0',  // Very light gray
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
  },
  purple: {
    primary: '#6b21a8',      // Purple
    secondary: '#a855f7',    // Violet
    accent: '#c084fc',       // Light violet
    text: '#1e293b',         // Slate
    textLight: '#475569',    // Medium slate
    textMuted: '#64748b',    // Light slate
    background: '#ffffff',   // White
    backgroundAlt: '#faf5ff', // Very light purple
    border: '#d8b4fe',       // Light purple
    borderLight: '#e9d5ff',  // Very light purple
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
  },
  teal: {
    primary: '#0f766e',      // Teal
    secondary: '#14b8a6',    // Cyan
    accent: '#5eead4',       // Light cyan
    text: '#1e293b',         // Slate
    textLight: '#475569',    // Medium slate
    textMuted: '#64748b',    // Light slate
    background: '#ffffff',   // White
    backgroundAlt: '#f0fdfa', // Very light teal
    border: '#99f6e4',       // Light teal
    borderLight: '#ccfbf1',  // Very light teal
    success: '#059669',      // Dark green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
  },
  orange: {
    primary: '#c2410c',      // Orange
    secondary: '#f97316',    // Bright orange
    accent: '#fb923c',       // Light orange
    text: '#1e293b',         // Slate
    textLight: '#475569',    // Medium slate
    textMuted: '#64748b',    // Light slate
    background: '#ffffff',   // White
    backgroundAlt: '#fff7ed', // Very light orange
    border: '#fdba74',       // Light orange
    borderLight: '#fed7aa',  // Very light orange
    success: '#10b981',      // Green
    warning: '#d97706',      // Dark amber
    error: '#ef4444',        // Red
  },
};

/**
 * Export COLOR_SCHEMES as alias for template generation
 */
export const COLOR_SCHEMES = colorPalettes;

/**
 * Get color palette by name
 */
export function getColorPalette(name: string): ColorPalette {
  return colorPalettes[name] || colorPalettes.professional;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Lighten a color by percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const amount = Math.round(2.55 * percent);

  const newR = Math.min(255, r + amount);
  const newG = Math.min(255, g + amount);
  const newB = Math.min(255, b + amount);

  return rgbToHex(newR, newG, newB);
}

/**
 * Darken a color by percentage
 */
export function darkenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const amount = Math.round(2.55 * percent);

  const newR = Math.max(0, r - amount);
  const newG = Math.max(0, g - amount);
  const newB = Math.max(0, b - amount);

  return rgbToHex(newR, newG, newB);
}

/**
 * Add opacity to hex color (returns rgba string)
 */
export function addOpacity(hex: string, opacity: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get contrasting text color (black or white) for background
 */
export function getContrastTextColor(backgroundHex: string): string {
  const { r, g, b } = hexToRgb(backgroundHex);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Create a custom color palette from primary and secondary colors
 */
export function createCustomPalette(
  primary: string,
  secondary?: string
): ColorPalette {
  const secondaryColor = secondary || darkenColor(primary, 20);

  return {
    primary,
    secondary: secondaryColor,
    accent: lightenColor(primary, 10),
    text: '#0f172a',
    textLight: '#334155',
    textMuted: '#64748b',
    background: '#ffffff',
    backgroundAlt: lightenColor(primary, 45),
    border: lightenColor(primary, 35),
    borderLight: lightenColor(primary, 40),
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };
}

/**
 * Validate hex color format
 */
export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Ensure color is valid, return default if not
 */
export function ensureValidColor(color: string, defaultColor: string = '#000000'): string {
  return isValidHexColor(color) ? color : defaultColor;
}
