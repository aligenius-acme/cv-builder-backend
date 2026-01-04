import { TemplateConfig } from '../types';

// ============================================================================
// COLOR PALETTES - Modern, professional color schemes
// ============================================================================

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;      // Main accent color
  secondary: string;    // Secondary/darker shade
  accent: string;       // Background accent
  text: string;         // Primary text
  muted: string;        // Muted/secondary text
  background: string;   // Section backgrounds
}

export const COLOR_PALETTES: ColorPalette[] = [
  // Blues
  { id: 'navy', name: 'Navy', primary: '#1e3a5f', secondary: '#0f2744', accent: '#e8f4fc', text: '#1a1a2e', muted: '#64748b', background: '#f8fafc' },
  { id: 'ocean', name: 'Ocean', primary: '#0369a1', secondary: '#075985', accent: '#e0f2fe', text: '#0c4a6e', muted: '#64748b', background: '#f0f9ff' },
  { id: 'royal', name: 'Royal', primary: '#1d4ed8', secondary: '#1e40af', accent: '#dbeafe', text: '#1e3a8a', muted: '#6b7280', background: '#eff6ff' },
  { id: 'slate', name: 'Slate', primary: '#334155', secondary: '#1e293b', accent: '#f1f5f9', text: '#0f172a', muted: '#64748b', background: '#f8fafc' },

  // Greens
  { id: 'emerald', name: 'Emerald', primary: '#059669', secondary: '#047857', accent: '#d1fae5', text: '#064e3b', muted: '#6b7280', background: '#ecfdf5' },
  { id: 'forest', name: 'Forest', primary: '#166534', secondary: '#14532d', accent: '#dcfce7', text: '#14532d', muted: '#6b7280', background: '#f0fdf4' },
  { id: 'teal', name: 'Teal', primary: '#0d9488', secondary: '#0f766e', accent: '#ccfbf1', text: '#134e4a', muted: '#64748b', background: '#f0fdfa' },

  // Warm tones
  { id: 'burgundy', name: 'Burgundy', primary: '#881337', secondary: '#701a3c', accent: '#fce7f3', text: '#500724', muted: '#6b7280', background: '#fdf2f8' },
  { id: 'rust', name: 'Rust', primary: '#c2410c', secondary: '#9a3412', accent: '#ffedd5', text: '#7c2d12', muted: '#78716c', background: '#fff7ed' },
  { id: 'wine', name: 'Wine', primary: '#7f1d1d', secondary: '#991b1b', accent: '#fee2e2', text: '#450a0a', muted: '#78716c', background: '#fef2f2' },

  // Neutrals & Modern
  { id: 'charcoal', name: 'Charcoal', primary: '#18181b', secondary: '#27272a', accent: '#f4f4f5', text: '#09090b', muted: '#71717a', background: '#fafafa' },
  { id: 'graphite', name: 'Graphite', primary: '#374151', secondary: '#1f2937', accent: '#f3f4f6', text: '#111827', muted: '#6b7280', background: '#f9fafb' },
  { id: 'stone', name: 'Stone', primary: '#44403c', secondary: '#292524', accent: '#f5f5f4', text: '#1c1917', muted: '#78716c', background: '#fafaf9' },

  // Purples & Creative
  { id: 'violet', name: 'Violet', primary: '#7c3aed', secondary: '#6d28d9', accent: '#ede9fe', text: '#4c1d95', muted: '#6b7280', background: '#f5f3ff' },
  { id: 'indigo', name: 'Indigo', primary: '#4f46e5', secondary: '#4338ca', accent: '#e0e7ff', text: '#312e81', muted: '#6b7280', background: '#eef2ff' },
  { id: 'plum', name: 'Plum', primary: '#a21caf', secondary: '#86198f', accent: '#fae8ff', text: '#701a75', muted: '#6b7280', background: '#fdf4ff' },
];

// ============================================================================
// BASE LAYOUTS - Named templates inspired by cities (like resume.io)
// ============================================================================

export type BaseLayoutType =
  // Professional - Classic styles for traditional industries
  | 'london'            // Classic centered, elegant dividers
  | 'dublin'            // Traditional single-column, clean
  | 'stockholm'         // Refined, subtle accents
  | 'chicago'           // Executive banner style
  | 'boston'            // Compact, dense professional
  // Modern - Clean minimalist designs
  | 'berlin'            // Modern left-aligned, accent bars
  | 'amsterdam'         // Ultra-minimal, lots of whitespace
  | 'copenhagen'        // Clean two-column sidebar
  | 'vancouver'         // Modern with right sidebar
  | 'singapore'         // Tech-focused modern
  // Creative - Bold artistic designs
  | 'tokyo'             // Bold banner, creative layout
  | 'sydney'            // Timeline-based creative
  | 'barcelona'         // Colorful sidebar design
  | 'milan'             // Fashion-forward elegant
  | 'rio'               // Vibrant, eye-catching
  // Simple - Clean straightforward layouts
  | 'toronto'           // Simple single-column
  | 'seattle'           // Minimal clean design
  | 'austin'            // Casual professional
  | 'denver'            // Entry-level friendly
  | 'phoenix';          // Basic clean format

// Template style category (matches resume.io)
export type TemplateCategory = 'Professional' | 'Modern' | 'Creative' | 'Simple';

// Layout structure type
export type LayoutType = 'single-column' | 'two-column' | 'one-page';

// Special template features
export type TemplateFeature = 'ats-optimized' | 'photo-ready' | 'academic' | 'entry-level' | 'executive';

export interface BaseLayout {
  id: BaseLayoutType;
  name: string;
  description: string;
  category: TemplateCategory;
  layoutType: LayoutType;
  features: TemplateFeature[];
  headerStyle: 'centered' | 'left' | 'banner' | 'split';
  hasSidebar: boolean;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: number;
  hasPhoto?: boolean;
  margins: { top: number; right: number; bottom: number; left: number };
  fontSize: { header: number; subheader: number; body: number };
  sectionStyle: 'underlined' | 'boxed' | 'plain' | 'accent-bar' | 'dotted';
  skillsStyle: 'inline' | 'pills' | 'bars' | 'grid' | 'tags';
  bulletStyle: 'dot' | 'dash' | 'arrow' | 'check' | 'none';
  isATSSafe: boolean;
}

export const BASE_LAYOUTS: BaseLayout[] = [
  // ===== PROFESSIONAL - Classic styles for traditional industries =====
  {
    id: 'london',
    name: 'London',
    description: 'Classic elegance with traditional formatting, perfect for law, finance, and corporate roles',
    category: 'Professional',
    layoutType: 'single-column',
    features: ['ats-optimized', 'executive'],
    headerStyle: 'centered',
    hasSidebar: false,
    margins: { top: 48, right: 48, bottom: 48, left: 48 },
    fontSize: { header: 26, subheader: 11, body: 10 },
    sectionStyle: 'underlined',
    skillsStyle: 'inline',
    bulletStyle: 'dot',
    isATSSafe: true,
  },
  {
    id: 'dublin',
    name: 'Dublin',
    description: 'Clean traditional layout with clear sections, ideal for business and consulting',
    category: 'Professional',
    layoutType: 'single-column',
    features: ['ats-optimized'],
    headerStyle: 'left',
    hasSidebar: false,
    margins: { top: 44, right: 44, bottom: 44, left: 44 },
    fontSize: { header: 24, subheader: 11, body: 10 },
    sectionStyle: 'underlined',
    skillsStyle: 'inline',
    bulletStyle: 'dot',
    isATSSafe: true,
  },
  {
    id: 'stockholm',
    name: 'Stockholm',
    description: 'Refined Scandinavian design with subtle accents, great for healthcare and education',
    category: 'Professional',
    layoutType: 'single-column',
    features: ['ats-optimized'],
    headerStyle: 'centered',
    hasSidebar: false,
    margins: { top: 50, right: 50, bottom: 50, left: 50 },
    fontSize: { header: 28, subheader: 11, body: 10 },
    sectionStyle: 'dotted',
    skillsStyle: 'inline',
    bulletStyle: 'dot',
    isATSSafe: true,
  },
  {
    id: 'chicago',
    name: 'Chicago',
    description: 'Bold executive header for senior professionals and C-suite positions',
    category: 'Professional',
    layoutType: 'single-column',
    features: ['ats-optimized', 'executive'],
    headerStyle: 'banner',
    hasSidebar: false,
    margins: { top: 0, right: 40, bottom: 40, left: 40 },
    fontSize: { header: 32, subheader: 12, body: 10.5 },
    sectionStyle: 'boxed',
    skillsStyle: 'grid',
    bulletStyle: 'dot',
    isATSSafe: true,
  },
  {
    id: 'boston',
    name: 'Boston',
    description: 'Compact and dense layout for detailed experience, perfect for academia',
    category: 'Professional',
    layoutType: 'one-page',
    features: ['ats-optimized', 'academic'],
    headerStyle: 'left',
    hasSidebar: false,
    margins: { top: 32, right: 32, bottom: 32, left: 32 },
    fontSize: { header: 20, subheader: 10, body: 9 },
    sectionStyle: 'plain',
    skillsStyle: 'inline',
    bulletStyle: 'dot',
    isATSSafe: true,
  },

  // ===== MODERN - Fresh minimalist designs for tech and startups =====
  {
    id: 'berlin',
    name: 'Berlin',
    description: 'Modern left-aligned design with accent bars, ideal for IT and engineering',
    category: 'Modern',
    layoutType: 'single-column',
    features: ['ats-optimized'],
    headerStyle: 'left',
    hasSidebar: false,
    margins: { top: 40, right: 40, bottom: 40, left: 40 },
    fontSize: { header: 28, subheader: 11, body: 10 },
    sectionStyle: 'accent-bar',
    skillsStyle: 'tags',
    bulletStyle: 'arrow',
    isATSSafe: true,
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    description: 'Ultra-minimal with generous whitespace, perfect for marketing and HR',
    category: 'Modern',
    layoutType: 'single-column',
    features: ['ats-optimized'],
    headerStyle: 'left',
    hasSidebar: false,
    margins: { top: 56, right: 56, bottom: 56, left: 56 },
    fontSize: { header: 24, subheader: 10, body: 10 },
    sectionStyle: 'plain',
    skillsStyle: 'inline',
    bulletStyle: 'dash',
    isATSSafe: true,
  },
  {
    id: 'copenhagen',
    name: 'Copenhagen',
    description: 'Clean two-column with left sidebar, great for tech and startups',
    category: 'Modern',
    layoutType: 'two-column',
    features: ['photo-ready'],
    headerStyle: 'split',
    hasSidebar: true,
    sidebarPosition: 'left',
    sidebarWidth: 32,
    hasPhoto: true,
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    fontSize: { header: 22, subheader: 10, body: 9.5 },
    sectionStyle: 'plain',
    skillsStyle: 'pills',
    bulletStyle: 'arrow',
    isATSSafe: false,
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    description: 'Modern layout with right sidebar for skills, ideal for project managers',
    category: 'Modern',
    layoutType: 'two-column',
    features: [],
    headerStyle: 'left',
    hasSidebar: true,
    sidebarPosition: 'right',
    sidebarWidth: 30,
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    fontSize: { header: 26, subheader: 10, body: 10 },
    sectionStyle: 'plain',
    skillsStyle: 'bars',
    bulletStyle: 'dot',
    isATSSafe: false,
  },
  {
    id: 'singapore',
    name: 'Singapore',
    description: 'Tech-focused design with skill grids, perfect for developers and engineers',
    category: 'Modern',
    layoutType: 'two-column',
    features: ['photo-ready'],
    headerStyle: 'split',
    hasSidebar: true,
    sidebarPosition: 'left',
    sidebarWidth: 34,
    hasPhoto: true,
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    fontSize: { header: 24, subheader: 10, body: 9.5 },
    sectionStyle: 'plain',
    skillsStyle: 'grid',
    bulletStyle: 'arrow',
    isATSSafe: false,
  },

  // ===== CREATIVE - Bold designs for artistic professionals =====
  {
    id: 'tokyo',
    name: 'Tokyo',
    description: 'Bold banner design with creative flair, ideal for designers and artists',
    category: 'Creative',
    layoutType: 'single-column',
    features: [],
    headerStyle: 'banner',
    hasSidebar: false,
    margins: { top: 0, right: 36, bottom: 36, left: 36 },
    fontSize: { header: 34, subheader: 12, body: 10 },
    sectionStyle: 'accent-bar',
    skillsStyle: 'pills',
    bulletStyle: 'arrow',
    isATSSafe: false,
  },
  {
    id: 'sydney',
    name: 'Sydney',
    description: 'Timeline-based layout showing career progression, great for experienced creatives',
    category: 'Creative',
    layoutType: 'single-column',
    features: [],
    headerStyle: 'centered',
    hasSidebar: false,
    margins: { top: 44, right: 44, bottom: 44, left: 64 },
    fontSize: { header: 26, subheader: 11, body: 10 },
    sectionStyle: 'plain',
    skillsStyle: 'pills',
    bulletStyle: 'none',
    isATSSafe: false,
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    description: 'Colorful sidebar design with personality, perfect for photographers and videographers',
    category: 'Creative',
    layoutType: 'two-column',
    features: ['photo-ready'],
    headerStyle: 'split',
    hasSidebar: true,
    sidebarPosition: 'left',
    sidebarWidth: 35,
    hasPhoto: true,
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    fontSize: { header: 24, subheader: 10, body: 9.5 },
    sectionStyle: 'plain',
    skillsStyle: 'pills',
    bulletStyle: 'arrow',
    isATSSafe: false,
  },
  {
    id: 'milan',
    name: 'Milan',
    description: 'Fashion-forward elegant design, ideal for fashion and luxury industries',
    category: 'Creative',
    layoutType: 'single-column',
    features: ['photo-ready'],
    headerStyle: 'centered',
    hasSidebar: false,
    hasPhoto: true,
    margins: { top: 40, right: 48, bottom: 40, left: 48 },
    fontSize: { header: 30, subheader: 11, body: 10 },
    sectionStyle: 'plain',
    skillsStyle: 'inline',
    bulletStyle: 'dash',
    isATSSafe: false,
  },
  {
    id: 'rio',
    name: 'Rio',
    description: 'Vibrant and eye-catching design, great for entertainment and media',
    category: 'Creative',
    layoutType: 'single-column',
    features: [],
    headerStyle: 'left',
    hasSidebar: false,
    margins: { top: 36, right: 40, bottom: 36, left: 40 },
    fontSize: { header: 30, subheader: 12, body: 10 },
    sectionStyle: 'boxed',
    skillsStyle: 'pills',
    bulletStyle: 'arrow',
    isATSSafe: false,
  },

  // ===== SIMPLE - Clean straightforward layouts =====
  {
    id: 'toronto',
    name: 'Toronto',
    description: 'Simple and professional, perfect for hospitality and retail',
    category: 'Simple',
    layoutType: 'single-column',
    features: ['ats-optimized', 'entry-level'],
    headerStyle: 'left',
    hasSidebar: false,
    margins: { top: 40, right: 40, bottom: 40, left: 40 },
    fontSize: { header: 24, subheader: 11, body: 10 },
    sectionStyle: 'underlined',
    skillsStyle: 'inline',
    bulletStyle: 'dot',
    isATSSafe: true,
  },
  {
    id: 'seattle',
    name: 'Seattle',
    description: 'Minimal clean design with clear hierarchy, ideal for students and interns',
    category: 'Simple',
    layoutType: 'single-column',
    features: ['ats-optimized', 'entry-level'],
    headerStyle: 'left',
    hasSidebar: false,
    margins: { top: 48, right: 48, bottom: 48, left: 48 },
    fontSize: { header: 22, subheader: 10, body: 10 },
    sectionStyle: 'plain',
    skillsStyle: 'inline',
    bulletStyle: 'dot',
    isATSSafe: true,
  },
  {
    id: 'austin',
    name: 'Austin',
    description: 'Casual yet professional, great for startups and small businesses',
    category: 'Simple',
    layoutType: 'single-column',
    features: ['ats-optimized'],
    headerStyle: 'left',
    hasSidebar: false,
    margins: { top: 44, right: 44, bottom: 44, left: 44 },
    fontSize: { header: 26, subheader: 11, body: 10 },
    sectionStyle: 'accent-bar',
    skillsStyle: 'tags',
    bulletStyle: 'arrow',
    isATSSafe: true,
  },
  {
    id: 'denver',
    name: 'Denver',
    description: 'Entry-level friendly with clear sections, perfect for first-time job seekers',
    category: 'Simple',
    layoutType: 'one-page',
    features: ['ats-optimized', 'entry-level'],
    headerStyle: 'centered',
    hasSidebar: false,
    margins: { top: 40, right: 40, bottom: 40, left: 40 },
    fontSize: { header: 24, subheader: 11, body: 10 },
    sectionStyle: 'underlined',
    skillsStyle: 'inline',
    bulletStyle: 'dot',
    isATSSafe: true,
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    description: 'Basic clean format that works everywhere, ideal for career changers',
    category: 'Simple',
    layoutType: 'single-column',
    features: ['ats-optimized', 'entry-level'],
    headerStyle: 'left',
    hasSidebar: false,
    margins: { top: 44, right: 44, bottom: 44, left: 44 },
    fontSize: { header: 24, subheader: 10, body: 10 },
    sectionStyle: 'plain',
    skillsStyle: 'inline',
    bulletStyle: 'dot',
    isATSSafe: true,
  },
];

// ============================================================================
// TEMPLATE VARIANTS - Combinations of layouts and colors
// ============================================================================

export interface TemplateVariant {
  id: string;
  name: string;
  description: string;
  layoutId: BaseLayoutType;
  colorId: string;
  category: TemplateCategory;
  layoutType: LayoutType;
  features: TemplateFeature[];
  tags: string[];
  isPopular?: boolean;
  isNew?: boolean;
  isATSSafe: boolean;
  hasPhoto?: boolean;
}

// Generate all template variants
function generateTemplateVariants(): TemplateVariant[] {
  const variants: TemplateVariant[] = [];

  // Popular combinations (curated - like resume.io's featured templates)
  const popularCombos = [
    // Professional favorites
    { layout: 'london', color: 'navy', popular: true },
    { layout: 'london', color: 'charcoal', popular: true },
    { layout: 'dublin', color: 'slate', popular: true },
    { layout: 'chicago', color: 'navy', popular: true },
    // Modern favorites
    { layout: 'berlin', color: 'ocean', popular: true },
    { layout: 'copenhagen', color: 'teal', popular: true },
    { layout: 'singapore', color: 'indigo', popular: true },
    // Creative favorites
    { layout: 'tokyo', color: 'violet', popular: true },
    { layout: 'barcelona', color: 'burgundy', popular: true },
    // Simple favorites
    { layout: 'toronto', color: 'graphite', popular: true },
    { layout: 'seattle', color: 'slate', popular: true },
  ];

  // New templates (recently added)
  const newTemplates = ['milan', 'rio', 'austin', 'phoenix'];

  // Generate variants for each layout × color combination
  for (const layout of BASE_LAYOUTS) {
    for (const color of COLOR_PALETTES) {
      const id = `${layout.id}-${color.id}`;
      const isPopular = popularCombos.some(c => c.layout === layout.id && c.color === color.id);
      const isNew = newTemplates.includes(layout.id);

      // Create descriptive name
      const name = `${layout.name} ${color.name}`;

      // Generate tags based on layout properties
      const tags: string[] = [];

      // Category tag
      tags.push(layout.category.toLowerCase());

      // Layout type tag
      tags.push(layout.layoutType);

      // Feature tags
      for (const feature of layout.features) {
        tags.push(feature);
      }

      // Additional tags
      if (layout.isATSSafe) tags.push('ats-friendly');
      if (layout.hasSidebar) tags.push('sidebar');
      if (layout.hasPhoto) tags.push('photo');
      if (isPopular) tags.push('popular');
      if (isNew) tags.push('new');

      variants.push({
        id,
        name,
        description: layout.description,
        layoutId: layout.id,
        colorId: color.id,
        category: layout.category,
        layoutType: layout.layoutType,
        features: layout.features,
        tags,
        isPopular,
        isNew,
        isATSSafe: layout.isATSSafe,
        hasPhoto: layout.hasPhoto,
      });
    }
  }

  return variants;
}

export const TEMPLATE_VARIANTS = generateTemplateVariants();

// ============================================================================
// EXTENDED TEMPLATE CONFIG (for PDF generation)
// ============================================================================

export interface ExtendedTemplateConfig extends TemplateConfig {
  layoutType: BaseLayoutType;
  headerStyle: 'centered' | 'left-aligned' | 'boxed' | 'banner' | 'split';
  sectionStyle: 'underlined' | 'boxed' | 'plain' | 'highlighted' | 'accent-bar' | 'dotted';
  skillsStyle: 'inline' | 'pills' | 'list' | 'grid' | 'bars' | 'tags';
  showIcons: boolean;
  accentColor?: string;
  sidebarWidth?: number;
  bulletStyle: 'dot' | 'dash' | 'arrow' | 'check' | 'none';
  hasSidebar: boolean;
  sidebarPosition?: 'left' | 'right';
  // Color palette colors
  textColor: string;
  mutedColor: string;
  backgroundColor: string;
}

// Get full template config from variant ID
export function getTemplateConfig(variantId: string): ExtendedTemplateConfig {
  const variant = TEMPLATE_VARIANTS.find(v => v.id === variantId);

  // Fallback to classic-navy if not found
  const layoutId = variant?.layoutId || 'classic';
  const colorId = variant?.colorId || 'navy';

  const layout = BASE_LAYOUTS.find(l => l.id === layoutId) || BASE_LAYOUTS[0];
  const color = COLOR_PALETTES.find(c => c.id === colorId) || COLOR_PALETTES[0];

  return {
    name: variant?.name || 'Classic Navy',
    layout: layout.hasSidebar ? 'two-column' : 'single-column',
    layoutType: layout.id,
    headerStyle: layout.headerStyle === 'centered' ? 'centered' :
                 layout.headerStyle === 'banner' ? 'banner' :
                 layout.headerStyle === 'split' ? 'split' : 'left-aligned',
    sectionStyle: layout.sectionStyle === 'accent-bar' ? 'highlighted' : layout.sectionStyle,
    skillsStyle: layout.skillsStyle === 'tags' ? 'pills' :
                 layout.skillsStyle === 'bars' ? 'list' : layout.skillsStyle,
    showIcons: layout.id === 'singapore' || layout.id === 'copenhagen' || layout.id === 'barcelona',
    bulletStyle: layout.bulletStyle,
    hasSidebar: layout.hasSidebar,
    sidebarPosition: layout.sidebarPosition,
    sidebarWidth: layout.sidebarWidth,
    primaryColor: color.primary,
    secondaryColor: color.secondary,
    accentColor: color.accent,
    textColor: color.text,
    mutedColor: color.muted,
    backgroundColor: color.background,
    fontFamily: 'Helvetica',
    fontSize: layout.fontSize,
    margins: layout.margins,
    sections: {
      order: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
      visible: {
        summary: true,
        experience: true,
        education: true,
        skills: true,
        certifications: true,
        projects: true,
      },
    },
  };
}

// ============================================================================
// TEMPLATE METADATA (for frontend)
// ============================================================================

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  preview: string;
  tags: string[];
  category: TemplateCategory;
  layoutType: LayoutType;
  features: TemplateFeature[];
  colorHex: string;
  colorName: string;
  layoutName: string;
  isPopular?: boolean;
  isNew?: boolean;
  isATSSafe: boolean;
  hasPhoto?: boolean;
}

// Get all templates for frontend
export function getAllTemplates(): TemplateMetadata[] {
  return TEMPLATE_VARIANTS.map(variant => {
    const color = COLOR_PALETTES.find(c => c.id === variant.colorId);
    const layout = BASE_LAYOUTS.find(l => l.id === variant.layoutId);
    return {
      id: variant.id,
      name: variant.name,
      description: variant.description,
      preview: `/templates/${variant.id}.png`,
      tags: variant.tags,
      category: variant.category,
      layoutType: variant.layoutType,
      features: variant.features,
      colorHex: color?.primary || '#1e3a5f',
      colorName: color?.name || 'Navy',
      layoutName: layout?.name || 'London',
      isPopular: variant.isPopular,
      isNew: variant.isNew,
      isATSSafe: variant.isATSSafe,
      hasPhoto: variant.hasPhoto,
    };
  });
}

// Get templates grouped by layout (for frontend display)
export function getTemplatesGroupedByLayout(): Record<string, TemplateMetadata[]> {
  const templates = getAllTemplates();
  const grouped: Record<string, TemplateMetadata[]> = {};

  for (const template of templates) {
    if (!grouped[template.layoutName]) {
      grouped[template.layoutName] = [];
    }
    grouped[template.layoutName].push(template);
  }

  return grouped;
}

// Get templates by feature
export function getTemplatesByFeature(feature: TemplateFeature): TemplateMetadata[] {
  return getAllTemplates().filter(t => t.features.includes(feature));
}

// Get templates by layout type
export function getTemplatesByLayoutType(layoutType: LayoutType): TemplateMetadata[] {
  return getAllTemplates().filter(t => t.layoutType === layoutType);
}

// Get template by ID (legacy support)
export function getTemplate(templateId: string): ExtendedTemplateConfig {
  return getTemplateConfig(templateId);
}

// Validate template ID
export function isValidTemplate(templateId: string): boolean {
  return TEMPLATE_VARIANTS.some(v => v.id === templateId);
}

// Get templates by category
export function getTemplatesByCategory(category: string): TemplateMetadata[] {
  return getAllTemplates().filter(t => t.category === category);
}

// Get popular templates
export function getPopularTemplates(): TemplateMetadata[] {
  return getAllTemplates().filter(t => t.isPopular);
}

// Get ATS-safe templates
export function getATSSafeTemplates(): TemplateMetadata[] {
  return getAllTemplates().filter(t => t.isATSSafe);
}
