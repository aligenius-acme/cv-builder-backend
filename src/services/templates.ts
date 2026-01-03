import { TemplateConfig } from '../types';

// Layout types for different visual styles
export type LayoutType =
  | 'classic'        // Traditional single-column, centered header
  | 'modern'         // Two-column with colored sidebar for contact/skills
  | 'minimal'        // Clean single-column with minimal styling
  | 'ats-optimized'  // Plain text, maximum ATS compatibility
  | 'executive'      // Bold header, prominent summary section
  | 'creative';      // Colorful sections with boxes and accents

// Extended template config with layout-specific options
export interface ExtendedTemplateConfig extends TemplateConfig {
  layoutType: LayoutType;
  headerStyle: 'centered' | 'left-aligned' | 'boxed' | 'banner';
  sectionStyle: 'underlined' | 'boxed' | 'plain' | 'highlighted';
  skillsStyle: 'inline' | 'pills' | 'list' | 'grid';
  showIcons: boolean;
  accentColor?: string;
  sidebarWidth?: number;  // For two-column layouts (percentage)
  bulletStyle: 'dot' | 'dash' | 'arrow' | 'none';
}

// Predefined resume templates with distinct layouts
export const RESUME_TEMPLATES: Record<string, ExtendedTemplateConfig> = {
  professional: {
    name: 'Professional',
    layoutType: 'classic',
    layout: 'single-column',
    headerStyle: 'centered',
    sectionStyle: 'underlined',
    skillsStyle: 'inline',
    showIcons: false,
    bulletStyle: 'dot',
    primaryColor: '#1a365d',  // Navy blue
    secondaryColor: '#2c5282',
    fontFamily: 'Helvetica',
    fontSize: {
      header: 26,
      subheader: 13,
      body: 10.5,
    },
    margins: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50,
    },
    sections: {
      order: ['summary', 'experience', 'education', 'skills', 'certifications', 'projects'],
      visible: {
        summary: true,
        experience: true,
        education: true,
        skills: true,
        certifications: true,
        projects: true,
      },
    },
  },

  modern: {
    name: 'Modern',
    layoutType: 'modern',
    layout: 'two-column',
    headerStyle: 'left-aligned',
    sectionStyle: 'plain',
    skillsStyle: 'pills',
    showIcons: true,
    bulletStyle: 'arrow',
    primaryColor: '#0d9488',  // Teal
    secondaryColor: '#134e4a',
    accentColor: '#f0fdfa',   // Light teal background
    sidebarWidth: 35,
    fontFamily: 'Helvetica',
    fontSize: {
      header: 28,
      subheader: 12,
      body: 10,
    },
    margins: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    sections: {
      order: ['summary', 'experience', 'projects', 'education', 'skills', 'certifications'],
      visible: {
        summary: true,
        experience: true,
        education: true,
        skills: true,
        certifications: true,
        projects: true,
      },
    },
  },

  minimal: {
    name: 'Minimal',
    layoutType: 'minimal',
    layout: 'single-column',
    headerStyle: 'left-aligned',
    sectionStyle: 'plain',
    skillsStyle: 'inline',
    showIcons: false,
    bulletStyle: 'dash',
    primaryColor: '#18181b',  // Near black
    secondaryColor: '#3f3f46',
    fontFamily: 'Helvetica',
    fontSize: {
      header: 22,
      subheader: 11,
      body: 10,
    },
    margins: {
      top: 60,
      right: 60,
      bottom: 60,
      left: 60,
    },
    sections: {
      order: ['experience', 'education', 'skills', 'projects', 'certifications', 'summary'],
      visible: {
        summary: false,  // Minimal typically skips summary
        experience: true,
        education: true,
        skills: true,
        certifications: true,
        projects: true,
      },
    },
  },

  'ats-friendly': {
    name: 'ATS-Friendly',
    layoutType: 'ats-optimized',
    layout: 'single-column',
    headerStyle: 'left-aligned',
    sectionStyle: 'underlined',
    skillsStyle: 'list',
    showIcons: false,
    bulletStyle: 'dot',
    primaryColor: '#000000',  // Pure black for max contrast
    secondaryColor: '#000000',
    fontFamily: 'Helvetica',
    fontSize: {
      header: 18,
      subheader: 12,
      body: 11,
    },
    margins: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50,
    },
    sections: {
      order: ['summary', 'skills', 'experience', 'education', 'certifications', 'projects'],
      visible: {
        summary: true,
        experience: true,
        education: true,
        skills: true,
        certifications: true,
        projects: true,
      },
    },
  },

  executive: {
    name: 'Executive',
    layoutType: 'executive',
    layout: 'single-column',
    headerStyle: 'banner',
    sectionStyle: 'boxed',
    skillsStyle: 'grid',
    showIcons: false,
    bulletStyle: 'dot',
    primaryColor: '#1e3a5f',  // Dark blue
    secondaryColor: '#2c5282',
    accentColor: '#ebf8ff',   // Light blue
    fontFamily: 'Helvetica',
    fontSize: {
      header: 30,
      subheader: 14,
      body: 11,
    },
    margins: {
      top: 0,
      right: 40,
      bottom: 40,
      left: 40,
    },
    sections: {
      order: ['summary', 'experience', 'skills', 'education', 'certifications', 'projects'],
      visible: {
        summary: true,
        experience: true,
        education: true,
        skills: true,
        certifications: true,
        projects: true,
      },
    },
  },

  creative: {
    name: 'Creative',
    layoutType: 'creative',
    layout: 'single-column',
    headerStyle: 'boxed',
    sectionStyle: 'highlighted',
    skillsStyle: 'pills',
    showIcons: true,
    bulletStyle: 'arrow',
    primaryColor: '#7c3aed',  // Purple
    secondaryColor: '#5b21b6',
    accentColor: '#f5f3ff',   // Light purple
    fontFamily: 'Helvetica',
    fontSize: {
      header: 32,
      subheader: 13,
      body: 10,
    },
    margins: {
      top: 30,
      right: 40,
      bottom: 30,
      left: 40,
    },
    sections: {
      order: ['summary', 'skills', 'projects', 'experience', 'education', 'certifications'],
      visible: {
        summary: true,
        experience: true,
        education: true,
        skills: true,
        certifications: true,
        projects: true,
      },
    },
  },
};

// Template metadata for frontend display
export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  preview: string;
  tags: string[];
}

export const TEMPLATE_METADATA: TemplateMetadata[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Classic centered layout with navy accents. Ideal for corporate and traditional industries.',
    preview: '/templates/professional.png',
    tags: ['corporate', 'traditional', 'business'],
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column layout with teal sidebar. Perfect for tech, startups, and modern companies.',
    preview: '/templates/modern.png',
    tags: ['tech', 'startup', 'two-column'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, spacious design with no summary. Lets your experience speak for itself.',
    preview: '/templates/minimal.png',
    tags: ['simple', 'clean', 'elegant'],
  },
  {
    id: 'ats-friendly',
    name: 'ATS-Friendly',
    description: 'Maximum compatibility with Applicant Tracking Systems. Plain formatting, no columns.',
    preview: '/templates/ats-friendly.png',
    tags: ['ats', 'optimized', 'safe'],
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Bold header banner with prominent summary. Designed for senior and leadership roles.',
    preview: '/templates/executive.png',
    tags: ['senior', 'leadership', 'executive'],
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Colorful design with purple accents and pill-style skills. Stand out from the crowd.',
    preview: '/templates/creative.png',
    tags: ['creative', 'design', 'bold'],
  },
];

// Get template by ID
export function getTemplate(templateId: string): ExtendedTemplateConfig {
  return RESUME_TEMPLATES[templateId] || RESUME_TEMPLATES.professional;
}

// Get all available templates
export function getAllTemplates(): TemplateMetadata[] {
  return TEMPLATE_METADATA;
}

// Validate template ID
export function isValidTemplate(templateId: string): boolean {
  return templateId in RESUME_TEMPLATES;
}
