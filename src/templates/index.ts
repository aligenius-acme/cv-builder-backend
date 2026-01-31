/**
 * Template System Interface
 * Defines the structure for resume templates and their metadata
 */

import React from 'react';
import { Document } from 'docx';
import { ParsedResumeData } from '../types';
import { ColorPalette } from './shared/styles/colors';

/**
 * Template metadata
 */
export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'creative' | 'technical' | 'academic' | 'executive' | 'entry-level';
  previewImage?: string;
  colorPalettes: string[]; // Available color palette names
  features: TemplateFeatures;
  atsScore: number; // 0-100, how ATS-friendly the template is
  bestFor: string[]; // Industries or roles this template works best for
  version: string;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
  // New taxonomy fields
  primaryCategory?: string;
  designStyle?: string;
  atsCompatibility?: string;
  pageLength?: string;
  industryTags?: string[];
  targetRoles?: string[];
  experienceLevel?: string | string[]; // Can be single string or array of levels
  searchKeywords?: string[];
}

/**
 * Template feature flags
 */
export interface TemplateFeatures {
  twoColumn: boolean;
  headerImage: boolean;
  colorCustomization: boolean;
  sectionIcons: boolean;
  skillBars: boolean;
  timeline: boolean;
  portfolio: boolean;
  publications: boolean;
  languages: boolean;
  certifications: boolean;
}

/**
 * Props passed to PDF template components
 */
export interface TemplatePDFProps {
  data: ParsedResumeData;
  colors: ColorPalette;
  options?: TemplateOptions;
}

/**
 * Template rendering options
 */
export interface TemplateOptions {
  fontSize?: 'small' | 'medium' | 'large';
  margins?: 'narrow' | 'normal' | 'moderate' | 'wide';
  lineHeight?: 'compact' | 'normal' | 'relaxed';
  sectionOrder?: string[];
  hideSections?: string[];
  pageSize?: 'letter' | 'a4';
  showPageNumbers?: boolean;
  showLastUpdated?: boolean;
}

/**
 * Main template interface
 */
export interface ReactTemplate {
  id: string;
  name: string;
  metadata: TemplateMetadata;

  /**
   * React component for PDF rendering
   * Can be used with @react-pdf/renderer or similar libraries
   */
  PDFComponent: React.FC<TemplatePDFProps>;

  /**
   * Generate DOCX document
   * Returns a docx Document object that can be exported
   */
  generateDOCX: (data: ParsedResumeData, colors: ColorPalette, options?: TemplateOptions) => Document;

  /**
   * Optional: Generate HTML version
   */
  generateHTML?: (data: ParsedResumeData, colors: ColorPalette, options?: TemplateOptions) => string;

  /**
   * Validate if template can render the given data
   */
  validate?: (data: ParsedResumeData) => TemplateValidationResult;
}

/**
 * Template validation result
 */
export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingFields: string[];
}

/**
 * Template registry for managing available templates
 */
export class TemplateRegistry {
  private templates: Map<string, ReactTemplate> = new Map();

  /**
   * Register a new template
   */
  register(template: ReactTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): ReactTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Get all templates
   */
  getAllTemplates(): ReactTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: TemplateMetadata['category']): ReactTemplate[] {
    return this.getAllTemplates().filter(
      template => template.metadata.category === category
    );
  }

  /**
   * Get templates suitable for a role/industry
   */
  getTemplatesForRole(role: string): ReactTemplate[] {
    return this.getAllTemplates().filter(
      template => template.metadata.bestFor.some(
        bestFor => bestFor.toLowerCase().includes(role.toLowerCase())
      )
    );
  }

  /**
   * Get ATS-friendly templates (score > 80)
   */
  getATSFriendlyTemplates(): ReactTemplate[] {
    return this.getAllTemplates().filter(
      template => template.metadata.atsScore >= 80
    );
  }

  /**
   * Unregister a template
   */
  unregister(id: string): boolean {
    return this.templates.delete(id);
  }

  /**
   * Clear all templates
   */
  clear(): void {
    this.templates.clear();
  }

  /**
   * Get template count
   */
  count(): number {
    return this.templates.size;
  }
}

/**
 * Global template registry instance
 */
export const templateRegistry = new TemplateRegistry();

/**
 * Helper to create template metadata
 */
export function createTemplateMetadata(
  partial: Partial<TemplateMetadata> & Pick<TemplateMetadata, 'id' | 'name' | 'category'>
): TemplateMetadata {
  const now = new Date();

  return {
    description: '',
    previewImage: undefined,
    colorPalettes: ['professional'],
    features: {
      twoColumn: false,
      headerImage: false,
      colorCustomization: true,
      sectionIcons: false,
      skillBars: false,
      timeline: false,
      portfolio: false,
      publications: false,
      languages: false,
      certifications: false,
    },
    atsScore: 85,
    bestFor: [],
    version: '1.0.0',
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

/**
 * Helper to validate template data
 */
export function validateTemplateData(data: ParsedResumeData): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];

  // Required fields
  if (!data.contact) {
    errors.push('Contact information is required');
    missingFields.push('contact');
  } else {
    if (!data.contact.name) {
      warnings.push('Name is recommended in contact information');
      missingFields.push('contact.name');
    }
    if (!data.contact.email) {
      warnings.push('Email is recommended in contact information');
      missingFields.push('contact.email');
    }
  }

  // Recommended sections
  if (!data.experience || data.experience.length === 0) {
    warnings.push('Experience section is recommended');
    missingFields.push('experience');
  }

  if (!data.education || data.education.length === 0) {
    warnings.push('Education section is recommended');
    missingFields.push('education');
  }

  if (!data.skills || data.skills.length === 0) {
    warnings.push('Skills section is recommended');
    missingFields.push('skills');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingFields,
  };
}

/**
 * Export all shared components and utilities
 */
export * from './shared/components/Header';
export * from './shared/components/ContactInfo';
export * from './shared/components/SectionHeader';
export * from './shared/components/ExperienceSection';
export * from './shared/components/EducationSection';
export * from './shared/components/SkillsSection';
export * from './shared/components/ProjectsSection';
export * from './shared/components/CertificationsSection';

export * from './shared/styles/colors';
export * from './shared/styles/typography';
export * from './shared/styles/spacing';

export * from './shared/utils/formatters';
export * from './shared/utils/layoutHelpers';
export * from './shared/utils/atsOptimization';
