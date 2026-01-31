/**
 * Template Registry Service
 * Centralized service for managing and loading resume templates
 *
 * Features:
 * - Dynamic template loading
 * - Template filtering and search
 * - Smart recommendations
 * - Performance caching
 */

import { prisma } from '../utils/prisma';
import { ReactTemplate } from '../templates';
import { ParsedResumeData, SkillCategory } from '../types';
import { ExtendedTemplateConfig, COLOR_PALETTES } from './templates';

// Template cache
interface TemplateCache {
  template: ReactTemplate;
  timestamp: number;
}

const templateCache = new Map<string, TemplateCache>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Helper to normalize skills to string array
function normalizeSkillsArray(skills: string[] | SkillCategory[]): string[] {
  if (!skills || skills.length === 0) return [];

  // Check if it's categorized skills
  if (typeof skills[0] === 'object' && 'category' in skills[0]) {
    // Flatten categorized skills into a single array
    return (skills as SkillCategory[]).flatMap(cat => cat.items);
  }

  return skills as string[];
}

/**
 * Filter criteria for template search
 */
export interface TemplateFilters {
  primaryCategory?: string;
  designStyle?: string;
  atsCompatibility?: string;
  pageLength?: string;
  industryTags?: string[];
  targetRoles?: string[];
  experienceLevel?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

/**
 * Template metadata from database
 */
export interface TemplateMetadata {
  id: string;
  name: string;
  description: string | null;
  primaryCategory: string | null;
  designStyle: string | null;
  pageLength: string | null;
  atsCompatibility: string | null;
  industryTags: string[];
  targetRoles: string[];
  experienceLevel: string | null;
  searchKeywords: string[];
  popularityScore: number;
  isFeatured: boolean;
  supportedFormats: string[];
  usageCount: number;
  isPremium: boolean;
  isDefault: boolean;
  isAtsSafe: boolean;
  previewImageUrl: string | null;
  templateConfig: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all templates with optional filtering
 */
export async function getAllTemplates(filters?: TemplateFilters): Promise<TemplateMetadata[]> {
  const where: any = {};

  // Apply filters
  if (filters?.primaryCategory) {
    where.primaryCategory = filters.primaryCategory;
  }

  if (filters?.designStyle) {
    where.designStyle = filters.designStyle;
  }

  if (filters?.atsCompatibility) {
    where.atsCompatibility = filters.atsCompatibility;
  }

  if (filters?.pageLength) {
    where.pageLength = filters.pageLength;
  }

  if (filters?.experienceLevel) {
    where.experienceLevel = filters.experienceLevel;
  }

  if (filters?.isPremium !== undefined) {
    where.isPremium = filters.isPremium;
  }

  if (filters?.isFeatured !== undefined) {
    where.isFeatured = filters.isFeatured;
  }

  // Industry tags filter (array contains)
  if (filters?.industryTags && filters.industryTags.length > 0) {
    where.industryTags = {
      hasSome: filters.industryTags,
    };
  }

  // Target roles filter (array contains)
  if (filters?.targetRoles && filters.targetRoles.length > 0) {
    where.targetRoles = {
      hasSome: filters.targetRoles,
    };
  }

  // Search query (search in name, description, keywords)
  if (filters?.searchQuery) {
    where.OR = [
      { name: { contains: filters.searchQuery, mode: 'insensitive' } },
      { description: { contains: filters.searchQuery, mode: 'insensitive' } },
      { searchKeywords: { hasSome: [filters.searchQuery.toLowerCase()] } },
    ];
  }

  const templates = await prisma.resumeTemplate.findMany({
    where,
    orderBy: [
      { isFeatured: 'desc' },
      { popularityScore: 'desc' },
      { name: 'asc' },
    ],
    skip: filters?.offset || 0,
    take: filters?.limit || 1000, // High default limit to show all templates
  });

  return templates as TemplateMetadata[];
}

/**
 * Get template by ID with metadata
 */
export async function getTemplateById(id: string): Promise<TemplateMetadata | null> {
  const template = await prisma.resumeTemplate.findUnique({
    where: { id },
  });

  return template as TemplateMetadata | null;
}

/**
 * Get templates by category
 */
export async function getTemplatesByCategory(category: string): Promise<TemplateMetadata[]> {
  return getAllTemplates({ primaryCategory: category });
}

/**
 * Get templates by advanced filters
 */
export async function getTemplatesByFilters(filters: TemplateFilters): Promise<TemplateMetadata[]> {
  return getAllTemplates(filters);
}

/**
 * Get recommended templates based on user resume data
 */
export async function getRecommendedTemplates(
  userData?: ParsedResumeData,
  limit: number = 5
): Promise<TemplateMetadata[]> {
  // Start with base scoring
  const templates = await getAllTemplates();

  // Score each template
  const scoredTemplates = templates.map(template => {
    let score = template.popularityScore || 0;

    // If user data provided, apply personalization
    if (userData) {
      // Experience level matching
      const yearsOfExperience = calculateYearsOfExperience(userData);
      const experienceLevel = getExperienceLevel(yearsOfExperience);

      if (template.experienceLevel === experienceLevel) {
        score += 20;
      }

      // Industry matching
      if (userData.experience && userData.experience.length > 0) {
        const userIndustries = extractIndustries(userData);
        const matchingIndustries = userIndustries.filter(industry =>
          template.industryTags.some(tag => tag.includes(industry) || industry.includes(tag))
        );
        score += matchingIndustries.length * 10;
      }

      // Role matching
      if (userData.experience && userData.experience.length > 0) {
        const userRoles = extractRoles(userData);
        const matchingRoles = userRoles.filter(role =>
          template.targetRoles.some(tag => tag.includes(role) || role.includes(tag))
        );
        score += matchingRoles.length * 15;
      }

      // Tech skills matching (for tech templates)
      if (template.primaryCategory === 'tech-startup' && userData.skills) {
        const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker'];
        const normalizedSkills = normalizeSkillsArray(userData.skills);
        const hasTechSkills = normalizedSkills.some(skill =>
          techKeywords.some(keyword => skill.toLowerCase().includes(keyword))
        );
        if (hasTechSkills) {
          score += 25;
        }
      }

      // Design/Creative skills matching
      if (template.primaryCategory === 'creative-design' && userData.skills) {
        const designKeywords = ['design', 'figma', 'photoshop', 'illustrator', 'sketch', 'ux', 'ui'];
        const normalizedSkills = normalizeSkillsArray(userData.skills);
        const hasDesignSkills = normalizedSkills.some(skill =>
          designKeywords.some(keyword => skill.toLowerCase().includes(keyword))
        );
        if (hasDesignSkills) {
          score += 25;
        }
      }

      // Academic background (for academic templates)
      if (template.primaryCategory === 'academic-research' && userData.education) {
        const hasAdvancedDegree = userData.education.some(edu =>
          edu.degree.toLowerCase().includes('phd') ||
          edu.degree.toLowerCase().includes('doctorate') ||
          edu.degree.toLowerCase().includes('master')
        );
        if (hasAdvancedDegree) {
          score += 30;
        }
      }

      // Entry level boost (for students/entry)
      if (template.primaryCategory === 'entry-student' && yearsOfExperience < 3) {
        score += 20;
      }

      // Prefer ATS-safe for users with standard backgrounds
      if (template.atsCompatibility === 'ats-safe') {
        score += 10;
      }
    }

    return {
      ...template,
      recommendationScore: score,
    };
  });

  // Sort by recommendation score and return top N
  scoredTemplates.sort((a, b) => b.recommendationScore - a.recommendationScore);

  return scoredTemplates.slice(0, limit);
}

/**
 * Get available filter options (for frontend)
 */
export async function getFilterOptions() {
  const templates = await prisma.resumeTemplate.findMany({
    select: {
      primaryCategory: true,
      designStyle: true,
      atsCompatibility: true,
      pageLength: true,
      experienceLevel: true,
      industryTags: true,
      targetRoles: true,
    },
  });

  // Aggregate unique values
  const categories = new Set<string>();
  const designStyles = new Set<string>();
  const atsLevels = new Set<string>();
  const pageLengths = new Set<string>();
  const experienceLevels = new Set<string>();
  const industries = new Set<string>();
  const roles = new Set<string>();

  templates.forEach(template => {
    if (template.primaryCategory) categories.add(template.primaryCategory);
    if (template.designStyle) designStyles.add(template.designStyle);
    if (template.atsCompatibility) atsLevels.add(template.atsCompatibility);
    if (template.pageLength) pageLengths.add(template.pageLength);
    if (template.experienceLevel) experienceLevels.add(template.experienceLevel);
    template.industryTags.forEach(tag => industries.add(tag));
    template.targetRoles.forEach(role => roles.add(role));
  });

  return {
    categories: Array.from(categories).sort(),
    designStyles: Array.from(designStyles).sort(),
    atsCompatibilityLevels: Array.from(atsLevels).sort(),
    pageLengths: Array.from(pageLengths).sort(),
    experienceLevels: Array.from(experienceLevels).sort(),
    industries: Array.from(industries).sort(),
    roles: Array.from(roles).sort(),
  };
}

/**
 * Dynamically load template module
 */
export async function loadTemplateModule(templateId: string): Promise<ReactTemplate | null> {
  // Check cache first
  const cached = templateCache.get(templateId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.template;
  }

  try {
    // Get template metadata to determine category
    const metadata = await getTemplateById(templateId);
    if (!metadata) {
      console.warn(`Template not found in database: ${templateId}`);
      return null;
    }

    // Map category to import path
    const categoryMap: Record<string, string> = {
      'ats-professional': 'ats-professional',
      'tech-startup': 'tech-startup',
      'entry-student': 'entry-student',
      'creative-design': 'creative-design',
      'academic-research': 'academic-research',
      'executive-leadership': 'executive-leadership',
    };

    const category = metadata.primaryCategory || 'ats-professional';
    const categoryPath = categoryMap[category];

    if (!categoryPath) {
      console.warn(`Unknown category: ${category}`);
      return null;
    }

    // Try to import template
    try {
      const module = await import(`../templates/${categoryPath}/index.ts`);

      // Find template in the category's exported templates
      const templates = module.default || [];
      const template = templates.find((t: ReactTemplate) => t.id === templateId);

      if (template) {
        // Cache the template
        templateCache.set(templateId, {
          template,
          timestamp: Date.now(),
        });

        return template;
      }
    } catch (importError) {
      console.warn(`Could not import template ${templateId} from ${categoryPath}:`, importError);
    }

    return null;
  } catch (error) {
    console.error(`Error loading template ${templateId}:`, error);
    return null;
  }
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsage(templateId: string): Promise<void> {
  try {
    await prisma.resumeTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error(`Error incrementing usage for template ${templateId}:`, error);
  }
}

/**
 * Clear template cache
 */
export function clearTemplateCache(templateId?: string): void {
  if (templateId) {
    templateCache.delete(templateId);
  } else {
    templateCache.clear();
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate years of experience from resume data
 */
function calculateYearsOfExperience(data: ParsedResumeData): number {
  if (!data.experience || data.experience.length === 0) {
    return 0;
  }

  const now = new Date();
  let totalMonths = 0;

  for (const exp of data.experience) {
    const startDate = parseDate(exp.startDate || '');
    const endDate = exp.current ? now : parseDate(exp.endDate || '');

    if (startDate && endDate) {
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                     (endDate.getMonth() - startDate.getMonth());
      totalMonths += Math.max(0, months);
    }
  }

  return Math.floor(totalMonths / 12);
}

/**
 * Parse date string to Date object
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try various date formats
  const formats = [
    /(\w+)\s+(\d{4})/i,  // "January 2020"
    /(\d{1,2})\/(\d{4})/,  // "01/2020"
    /(\d{4})-(\d{2})/,     // "2020-01"
    /(\d{4})/,             // "2020"
  ];

  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (match.length === 3) {
        const monthStr = match[1].toLowerCase().substring(0, 3);
        const monthIndex = monthNames.indexOf(monthStr);
        const year = parseInt(match[2]);

        if (monthIndex >= 0) {
          return new Date(year, monthIndex, 1);
        }
      } else if (match.length === 2) {
        const year = parseInt(match[1]);
        return new Date(year, 0, 1);
      }
    }
  }

  return null;
}

/**
 * Get experience level from years
 */
function getExperienceLevel(years: number): string {
  if (years === 0) return 'entry';
  if (years <= 2) return 'entry';
  if (years <= 5) return 'mid';
  if (years <= 10) return 'senior';
  return 'executive';
}

/**
 * Extract industries from resume data
 */
function extractIndustries(data: ParsedResumeData): string[] {
  const industries: string[] = [];

  // Extract from experience companies
  if (data.experience) {
    data.experience.forEach(exp => {
      const company = exp.company.toLowerCase();

      // Simple keyword matching (could be enhanced with NLP)
      if (company.includes('bank') || company.includes('finance')) industries.push('finance');
      if (company.includes('tech') || company.includes('software')) industries.push('technology');
      if (company.includes('consult')) industries.push('consulting');
      if (company.includes('hospital') || company.includes('health')) industries.push('healthcare');
      if (company.includes('law') || company.includes('legal')) industries.push('legal');
      if (company.includes('research') || company.includes('university')) industries.push('research');
    });
  }

  return [...new Set(industries)]; // Remove duplicates
}

/**
 * Extract roles from resume data
 */
function extractRoles(data: ParsedResumeData): string[] {
  const roles: string[] = [];

  if (data.experience) {
    data.experience.forEach(exp => {
      const title = (exp.title || exp.position || '').toLowerCase();

      // Extract role keywords
      if (title.includes('engineer')) roles.push('engineer');
      if (title.includes('developer')) roles.push('developer');
      if (title.includes('designer')) roles.push('designer');
      if (title.includes('manager')) roles.push('manager');
      if (title.includes('analyst')) roles.push('analyst');
      if (title.includes('director')) roles.push('director');
      if (title.includes('consultant')) roles.push('consultant');
      if (title.includes('product')) roles.push('product-manager');
      if (title.includes('data')) roles.push('data-scientist');
      if (title.includes('researcher')) roles.push('researcher');
    });
  }

  return [...new Set(roles)]; // Remove duplicates
}

/**
 * Get template statistics
 */
export async function getTemplateStats() {
  const totalCount = await prisma.resumeTemplate.count();
  const categoryCount = await prisma.resumeTemplate.groupBy({
    by: ['primaryCategory'],
    _count: true,
  });

  const mostUsed = await prisma.resumeTemplate.findMany({
    orderBy: { usageCount: 'desc' },
    take: 10,
    select: {
      id: true,
      name: true,
      usageCount: true,
      primaryCategory: true,
    },
  });

  return {
    totalTemplates: totalCount,
    byCategory: categoryCount.reduce((acc, item) => {
      acc[item.primaryCategory || 'unknown'] = item._count;
      return acc;
    }, {} as Record<string, number>),
    mostUsed,
  };
}

/**
 * Get template configuration for PDF generation from database
 */
export async function getTemplateConfigFromDB(templateId: string): Promise<ExtendedTemplateConfig> {
  const template = await prisma.resumeTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  // Extract configuration from database
  const config = template.templateConfig as any || {};

  // Determine layout based on template name patterns (two-column templates)
  const nameLower = template.name.toLowerCase();
  const isTwoColumn =
    nameLower.includes('bold') ||
    nameLower.includes('casual') ||
    nameLower.includes('pro') ||
    nameLower.includes('portfolio') ||
    nameLower.includes('sidebar') ||
    nameLower.includes('modern') && template.primaryCategory === 'tech-startup';

  const layoutType = config.layout || (isTwoColumn ? 'two-column' : 'single-column');
  const hasSidebar = layoutType === 'two-column';

  // Determine header style from template name and category
  let headerStyle: 'centered' | 'left-aligned' | 'boxed' | 'banner' | 'split' = 'left-aligned';

  if (hasSidebar) {
    headerStyle = 'split';
  } else if (template.primaryCategory === 'executive-leadership' || nameLower.includes('executive') || nameLower.includes('elite') || nameLower.includes('c-suite') || nameLower.includes('ceo') || nameLower.includes('cfo') || nameLower.includes('cto')) {
    headerStyle = 'banner';
  } else if (template.primaryCategory === 'academic-research' || nameLower.includes('academic') || nameLower.includes('research') || nameLower.includes('professor') || nameLower.includes('phd')) {
    headerStyle = 'centered';
  } else if (template.primaryCategory === 'creative-design' && (nameLower.includes('bold') || nameLower.includes('creative') || nameLower.includes('portfolio'))) {
    headerStyle = 'boxed';
  }

  // Determine section style
  let sectionStyle: 'underlined' | 'boxed' | 'plain' | 'highlighted' | 'accent-bar' | 'dotted' = 'underlined';
  if (template.primaryCategory === 'creative-design') {
    sectionStyle = 'boxed';
  } else if (nameLower.includes('minimal') || nameLower.includes('clean')) {
    sectionStyle = 'plain';
  } else if (template.primaryCategory === 'tech-startup') {
    sectionStyle = 'accent-bar';
  }

  // Determine skills style
  let skillsStyle: 'inline' | 'pills' | 'list' | 'grid' | 'bars' | 'tags' = 'inline';
  if (template.primaryCategory === 'tech-startup' || nameLower.includes('developer') || nameLower.includes('engineer')) {
    skillsStyle = 'pills';
  } else if (template.primaryCategory === 'creative-design') {
    skillsStyle = 'tags';
  } else if (hasSidebar) {
    skillsStyle = 'list';
  }

  // Get color palette - extract from template name or use default
  const colorMatch = template.name.match(/(Navy|Ocean|Teal|Emerald|Forest|Indigo|Purple|Slate|Charcoal|Crimson|Ruby|Amber)/i);
  const colorName = colorMatch ? colorMatch[1].toLowerCase() : 'navy';
  const color = COLOR_PALETTES.find(c => c.id === colorName) || COLOR_PALETTES[0];

  console.log(`🎨 Template Config for "${template.name}" (${template.id}):`, {
    category: template.primaryCategory,
    layoutType,
    headerStyle,
    sectionStyle,
    skillsStyle,
    hasSidebar,
    fontFamily: template.primaryCategory === 'academic-research' ? 'Times-Roman' : 'Helvetica',
  });

  return {
    name: template.name,
    layout: layoutType,
    layoutType: template.id,
    headerStyle,
    sectionStyle,
    skillsStyle,
    showIcons: false,
    bulletStyle: hasSidebar ? 'dot' : 'dash',
    hasSidebar,
    sidebarPosition: hasSidebar ? 'left' : undefined,
    sidebarWidth: hasSidebar ? 280 : undefined,
    primaryColor: color.primary,
    secondaryColor: color.secondary,
    accentColor: color.accent,
    textColor: color.text,
    mutedColor: color.muted,
    backgroundColor: color.background,
    fontFamily: template.primaryCategory === 'academic-research' ? 'Times-Roman' : 'Helvetica',
    fontSize: {
      header: template.primaryCategory === 'executive-leadership' ? 28 : 24,
      subheader: 11,
      body: template.primaryCategory === 'academic-research' ? 9 : 10,
    },
    margins: hasSidebar
      ? { top: 0, right: 0, bottom: 0, left: 0 }
      : { top: 40, right: 48, bottom: 40, left: 48 },
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
