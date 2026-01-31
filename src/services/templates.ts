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
  // Optional extended fields for templates
  primaryDark?: string; // Darker shade of primary
  textLight?: string;   // Lighter text color
  textMuted?: string;   // Alias for muted
  backgroundAlt?: string; // Alternative background
  border?: string;      // Border color
  surface?: string;     // Surface color
  heading?: string;     // Heading text color
  body?: string;        // Body text color
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
// NEW TYPE SYSTEM - 2026 Enhanced Template Architecture
// ============================================================================

// Primary Category - Main use case classification
export type PrimaryCategory =
  | 'ats-professional'      // Corporate roles requiring ATS optimization
  | 'tech-startup'          // Modern tech and startup roles
  | 'creative-design'       // Design, creative, and visual professions
  | 'academic-research'     // Academic, research, and education
  | 'entry-student'         // Entry-level and student positions
  | 'executive-leadership'; // Senior and executive roles

// Design Style - Visual approach
export type DesignStyle =
  | 'minimal'      // Clean, lots of whitespace
  | 'modern'       // Contemporary, balanced
  | 'bold'         // Eye-catching, creative
  | 'traditional'; // Classic, conservative

// ATS Compatibility Level
export type ATSCompatibility =
  | 'ats-safe'      // Fully optimized for ATS parsing
  | 'ats-friendly'  // Good compatibility with most ATS
  | 'visual-first'; // Prioritizes visual appeal over ATS

// Page Length Classification
export type PageLength =
  | 'one-page'   // Fits on single page
  | 'standard'   // 1-2 pages
  | 'cv-length'; // 2+ pages for academic/research

// Enhanced Base Layout Interface
export interface EnhancedBaseLayout {
  // Core Identity
  id: string;
  name: string;
  description: string;

  // New Taxonomy
  primaryCategory: PrimaryCategory;
  designStyle: DesignStyle;
  atsCompatibility: ATSCompatibility;
  pageLength: PageLength;

  // Industry & Role Targeting
  industryTags: string[];        // e.g., ['finance', 'technology', 'healthcare']
  targetRoles: string[];         // e.g., ['software-engineer', 'product-manager']
  experienceLevel: string;       // 'entry', 'mid', 'senior', 'executive'
  searchKeywords: string[];      // SEO/search optimization terms

  // Visual Configuration (existing)
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

  // Engagement Metrics
  popularityScore: number;       // Algorithm-calculated popularity
  isFeatured: boolean;           // Editor's choice
  supportedFormats: string[];    // ['pdf', 'docx', 'html']
  usageCount: number;            // Total times used

  // Legacy compatibility
  layoutType: 'single-column' | 'two-column' | 'one-page';
}

// NEW_BASE_LAYOUTS - To be populated with enhanced templates
export const NEW_BASE_LAYOUTS: EnhancedBaseLayout[] = [
  // This will be populated in future modules with new template definitions
];

// ============================================================================
// INDUSTRY TAGS - Structured taxonomy for targeting
// ============================================================================

export const INDUSTRY_TAGS = {
  technology: ['software', 'it', 'engineering', 'data-science', 'cybersecurity', 'devops'],
  business: ['finance', 'consulting', 'accounting', 'banking', 'investment', 'insurance'],
  creative: ['design', 'marketing', 'advertising', 'media', 'entertainment', 'photography'],
  healthcare: ['medical', 'nursing', 'pharmacy', 'healthcare-admin', 'biotech', 'clinical'],
  education: ['teaching', 'academic', 'research', 'education-admin', 'training', 'tutoring'],
  sales: ['sales', 'business-development', 'account-management', 'retail', 'customer-success'],
  operations: ['operations', 'supply-chain', 'logistics', 'manufacturing', 'project-management'],
  legal: ['law', 'legal', 'compliance', 'paralegal', 'legal-admin'],
  engineering: ['mechanical', 'electrical', 'civil', 'chemical', 'aerospace', 'industrial'],
  hospitality: ['hospitality', 'food-service', 'hotel-management', 'tourism', 'event-planning'],
  nonprofit: ['nonprofit', 'social-services', 'community', 'advocacy', 'fundraising'],
  government: ['government', 'public-sector', 'policy', 'administration', 'military']
} as const;

// ============================================================================
// LEGACY SUPPORT - Old city-based types (DEPRECATED)
// ============================================================================

// Layout structure type (legacy)
export type LayoutType = 'single-column' | 'two-column' | 'one-page';

// OLD: Keep minimal legacy interface for backward compatibility
export interface LegacyBaseLayout {
  id: string;
  name: string;
  description: string;
  category?: string;
  features?: string[];
  isATSSafe?: boolean;
  layoutType: LayoutType;
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
}

// BaseLayout can be either new enhanced or legacy
export type BaseLayout = EnhancedBaseLayout | LegacyBaseLayout;

// OLD: Empty array - city-based layouts removed
export const BASE_LAYOUTS: BaseLayout[] = [];

// ============================================================================
// TEMPLATE VARIANTS - Combinations of layouts and colors
// ============================================================================

export interface TemplateVariant {
  id: string;
  name: string;
  description: string;
  layoutId: string;
  colorId: string;
  category?: string;
  layoutType: LayoutType;
  features?: string[];
  tags: string[];
  isPopular?: boolean;
  isNew?: boolean;
  isATSSafe: boolean;
  hasPhoto?: boolean;
}

// Generate all template variants (DEPRECATED - will use NEW_BASE_LAYOUTS)
function generateTemplateVariants(): TemplateVariant[] {
  const variants: TemplateVariant[] = [];

  // Use NEW_BASE_LAYOUTS when populated, fallback to empty for now
  const layouts = NEW_BASE_LAYOUTS.length > 0 ? NEW_BASE_LAYOUTS : BASE_LAYOUTS;

  // If no layouts, return empty array
  if (layouts.length === 0) {
    return variants;
  }

  // Generate variants for each layout × color combination
  for (const layout of layouts) {
    for (const color of COLOR_PALETTES) {
      const id = `${layout.id}-${color.id}`;

      // Create descriptive name
      const name = `${layout.name} ${color.name}`;

      // Generate tags based on layout properties
      const tags: string[] = [];

      // Add new taxonomy tags
      if ('primaryCategory' in layout) {
        tags.push(layout.primaryCategory);
        tags.push(layout.designStyle);
        tags.push(layout.atsCompatibility);
        tags.push(...layout.industryTags);
        tags.push(...layout.targetRoles);
      }

      // Layout type tag
      tags.push(layout.layoutType);

      // Additional tags
      const isATSSafe = 'atsCompatibility' in layout
        ? layout.atsCompatibility === 'ats-safe'
        : (layout.isATSSafe !== undefined ? layout.isATSSafe : false);

      if (isATSSafe) tags.push('ats-friendly');
      if (layout.hasSidebar) tags.push('sidebar');
      if (layout.hasPhoto) tags.push('photo');

      variants.push({
        id,
        name,
        description: layout.description,
        layoutId: layout.id,
        colorId: color.id,
        layoutType: layout.layoutType,
        tags,
        isATSSafe,
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
  layoutType: string;
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

  // Fallback defaults
  const layoutId = variant?.layoutId || 'default';
  const colorId = variant?.colorId || 'navy';

  // Try NEW_BASE_LAYOUTS first, then BASE_LAYOUTS
  const allLayouts = NEW_BASE_LAYOUTS.length > 0 ? NEW_BASE_LAYOUTS : BASE_LAYOUTS;
  const layout = allLayouts.find(l => l.id === layoutId);
  const color = COLOR_PALETTES.find(c => c.id === colorId) || COLOR_PALETTES[0];

  // Create default layout if none found
  const defaultLayout: EnhancedBaseLayout = {
    id: 'default',
    name: 'Default',
    description: 'Default template',
    primaryCategory: 'ats-professional',
    designStyle: 'minimal',
    atsCompatibility: 'ats-safe',
    pageLength: 'standard',
    industryTags: [],
    targetRoles: [],
    experienceLevel: 'mid',
    searchKeywords: [],
    headerStyle: 'left',
    hasSidebar: false,
    margins: { top: 40, right: 40, bottom: 40, left: 40 },
    fontSize: { header: 24, subheader: 11, body: 10 },
    sectionStyle: 'plain',
    skillsStyle: 'inline',
    bulletStyle: 'dot',
    popularityScore: 0,
    isFeatured: false,
    supportedFormats: ['pdf', 'docx'],
    usageCount: 0,
    layoutType: 'single-column',
  };

  const activeLayout = layout || defaultLayout;

  return {
    name: variant?.name || 'Default Template',
    layout: activeLayout.hasSidebar ? 'two-column' : 'single-column',
    layoutType: activeLayout.id,
    headerStyle: activeLayout.headerStyle === 'centered' ? 'centered' :
                 activeLayout.headerStyle === 'banner' ? 'banner' :
                 activeLayout.headerStyle === 'split' ? 'split' : 'left-aligned',
    sectionStyle: activeLayout.sectionStyle === 'accent-bar' ? 'highlighted' : activeLayout.sectionStyle,
    skillsStyle: activeLayout.skillsStyle === 'tags' ? 'pills' :
                 activeLayout.skillsStyle === 'bars' ? 'list' : activeLayout.skillsStyle,
    showIcons: false,
    bulletStyle: activeLayout.bulletStyle,
    hasSidebar: activeLayout.hasSidebar,
    sidebarPosition: activeLayout.sidebarPosition,
    sidebarWidth: activeLayout.sidebarWidth,
    primaryColor: color.primary,
    secondaryColor: color.secondary,
    accentColor: color.accent,
    textColor: color.text,
    mutedColor: color.muted,
    backgroundColor: color.background,
    fontFamily: 'Helvetica',
    fontSize: activeLayout.fontSize,
    margins: activeLayout.margins,
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
  category?: string;
  layoutType: LayoutType;
  features?: string[];
  colorHex: string;
  colorName: string;
  layoutName: string;
  isPopular?: boolean;
  isNew?: boolean;
  isATSSafe: boolean;
  hasPhoto?: boolean;
  // New taxonomy fields
  primaryCategory?: PrimaryCategory;
  designStyle?: DesignStyle;
  atsCompatibility?: ATSCompatibility;
  pageLength?: PageLength;
  industryTags?: string[];
  targetRoles?: string[];
  experienceLevel?: string;
  searchKeywords?: string[];
}

// Get all templates for frontend
export function getAllTemplates(): TemplateMetadata[] {
  return TEMPLATE_VARIANTS.map(variant => {
    const color = COLOR_PALETTES.find(c => c.id === variant.colorId);
    const allLayouts = NEW_BASE_LAYOUTS.length > 0 ? NEW_BASE_LAYOUTS : BASE_LAYOUTS;
    const layout = allLayouts.find(l => l.id === variant.layoutId);

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
      layoutName: layout?.name || 'Default',
      isPopular: variant.isPopular,
      isNew: variant.isNew,
      isATSSafe: variant.isATSSafe,
      hasPhoto: variant.hasPhoto,
      // New taxonomy fields
      primaryCategory: layout && 'primaryCategory' in layout ? layout.primaryCategory : undefined,
      designStyle: layout && 'designStyle' in layout ? layout.designStyle : undefined,
      atsCompatibility: layout && 'atsCompatibility' in layout ? layout.atsCompatibility : undefined,
      pageLength: layout && 'pageLength' in layout ? layout.pageLength : undefined,
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
export function getTemplatesByFeature(feature: string): TemplateMetadata[] {
  return getAllTemplates().filter(t => t.features?.includes(feature));
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

// Get templates by primary category (NEW)
export function getTemplatesByPrimaryCategory(primaryCategory: PrimaryCategory): TemplateMetadata[] {
  return getAllTemplates().filter(t => t.primaryCategory === primaryCategory);
}

// Get popular templates
export function getPopularTemplates(): TemplateMetadata[] {
  return getAllTemplates().filter(t => t.isPopular);
}

// Get ATS-safe templates
export function getATSSafeTemplates(): TemplateMetadata[] {
  return getAllTemplates().filter(t => t.isATSSafe);
}
