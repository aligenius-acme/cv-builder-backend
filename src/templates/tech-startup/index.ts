/**
 * Tech Startup Templates
 * Modern, developer-focused templates with emphasis on projects and skills
 *
 * This module contains 15 templates designed for tech industry roles:
 * - Software Engineers & Developers
 * - Product Managers
 * - DevOps & Infrastructure Engineers
 * - Engineering Leaders & Managers
 * - Data Scientists
 * - Full-Stack Developers
 *
 * All templates feature:
 * - Prominent skills sections
 * - GitHub/portfolio integration
 * - Project showcase
 * - Modern typography and design
 * - ATS-friendly layouts (80-90% compatibility)
 */

import { ReactTemplate } from '../index';
import { generateDOCX } from './generateDOCX';

// Import all template components
import DeveloperMinimalPDF, { DeveloperMinimalMetadata } from './DeveloperMinimal';
import TechModernPDF, { TechModernMetadata } from './TechModern';
import EngineerCleanPDF, { EngineerCleanMetadata } from './EngineerClean';
import StartupBoldPDF, { StartupBoldMetadata } from './StartupBold';
import ProductManagerPDF, { ProductManagerMetadata } from './ProductManager';
import CodeProfessionalPDF, { CodeProfessionalMetadata } from './CodeProfessional';
import DataSciencePDF, { DataScienceMetadata } from './DataScience';
import TechExecutivePDF, { TechExecutiveMetadata } from './TechExecutive';
import StartupCasualPDF, { StartupCasualMetadata } from './StartupCasual';
import DeveloperProPDF, { DeveloperProMetadata } from './DeveloperPro';
import SoftwareEngineerPDF, { SoftwareEngineerMetadata } from './SoftwareEngineer';
import FullStackPDF, { FullStackMetadata } from './FullStack';
import DevOpsProfessionalPDF, { DevOpsProfessionalMetadata } from './DevOpsProfessional';
import TechLeadPDF, { TechLeadMetadata } from './TechLead';
import EngineeringManagerPDF, { EngineeringManagerMetadata } from './EngineeringManager';

/**
 * Template 1: Developer Minimal
 * Clean, minimalist single-column design
 * ATS Score: 90/100 (ATS-safe)
 */
export const DeveloperMinimalTemplate: ReactTemplate = {
  id: 'developer-minimal',
  name: 'Developer Minimal',
  metadata: DeveloperMinimalMetadata,
  PDFComponent: DeveloperMinimalPDF,
  generateDOCX: async (data, colors, options) => await generateDOCX(data, colors, { ...options, templateId: 'developer-minimal' } as any),
};

/**
 * Template 2: Tech Modern
 * Modern design with cyan/teal palette
 * ATS Score: 88/100 (ATS-friendly)
 */
export const TechModernTemplate: ReactTemplate = {
  id: 'tech-modern',
  name: 'Tech Modern',
  metadata: TechModernMetadata,
  PDFComponent: TechModernPDF,
  generateDOCX: async (data, colors, options) => await generateDOCX(data, colors, { ...options, templateId: 'tech-modern' } as any),
};

/**
 * Template 3: Engineer Clean
 * Professional clean design for engineers
 * ATS Score: 90/100 (ATS-safe)
 */
export const EngineerCleanTemplate: ReactTemplate = {
  id: 'engineer-clean',
  name: 'Engineer Clean',
  metadata: EngineerCleanMetadata,
  PDFComponent: EngineerCleanPDF,
  generateDOCX: async (data, colors, options) => await generateDOCX(data, colors, { ...options, templateId: 'engineer-clean' } as any),
};

/**
 * Template 4: Startup Bold
 * Bold two-column sidebar design
 * ATS Score: 80/100 (ATS-friendly, two-column)
 */
export const StartupBoldTemplate: ReactTemplate = {
  id: 'startup-bold',
  name: 'Startup Bold',
  metadata: StartupBoldMetadata,
  PDFComponent: StartupBoldPDF,
  generateDOCX: async (data, colors, options) => {
    throw new Error('DOCX export not supported for two-column templates. Please use PDF export.');
  },
};

/**
 * Template 5: Product Manager
 * Professional template for PMs
 * ATS Score: 88/100 (ATS-friendly)
 */
export const ProductManagerTemplate: ReactTemplate = {
  id: 'product-manager',
  name: 'Product Manager',
  metadata: ProductManagerMetadata,
  PDFComponent: ProductManagerPDF,
  generateDOCX: async (data, colors, options) => await generateDOCX(data, colors, { ...options, templateId: 'product-manager' } as any),
};

/**
 * Template 6: Code Professional
 * Professional with code-style accents
 * ATS Score: 90/100 (ATS-safe)
 */
export const CodeProfessionalTemplate: ReactTemplate = {
  id: 'code-professional',
  name: 'Code Professional',
  metadata: CodeProfessionalMetadata,
  PDFComponent: CodeProfessionalPDF,
  generateDOCX: async (data, colors, options) => await generateDOCX(data, colors, { ...options, templateId: 'code-professional' } as any),
};

/**
 * Template 7: Data Science
 * Specialized for data scientists
 * ATS Score: 88/100 (ATS-friendly)
 */
export const DataScienceTemplate: ReactTemplate = {
  id: 'data-science',
  name: 'Data Science',
  metadata: DataScienceMetadata,
  PDFComponent: DataSciencePDF,
  generateDOCX: async (data, colors, options) => await generateDOCX(data, colors, { ...options, templateId: 'data-science' } as any),
};

/**
 * Template 8: Tech Executive
 * Executive-style for technical leaders
 * ATS Score: 85/100 (ATS-friendly)
 */
export const TechExecutiveTemplate: ReactTemplate = {
  id: 'tech-executive',
  name: 'Tech Executive',
  metadata: TechExecutiveMetadata,
  PDFComponent: TechExecutivePDF,
  generateDOCX: async (data, colors, options) => await generateDOCX(data, colors, { ...options, templateId: 'tech-executive' } as any),
};

/**
 * Template 9: Startup Casual
 * Casual two-column for startups
 * ATS Score: 82/100 (ATS-friendly, two-column)
 */
export const StartupCasualTemplate: ReactTemplate = {
  id: 'startup-casual',
  name: 'Startup Casual',
  metadata: StartupCasualMetadata,
  PDFComponent: StartupCasualPDF,
  generateDOCX: async (data, colors, options) => {
    throw new Error('DOCX export not supported for two-column templates. Please use PDF export.');
  },
};

/**
 * Template 10: Developer Pro
 * Professional two-column for experienced devs
 * ATS Score: 82/100 (ATS-friendly, two-column)
 */
export const DeveloperProTemplate: ReactTemplate = {
  id: 'developer-pro',
  name: 'Developer Pro',
  metadata: DeveloperProMetadata,
  PDFComponent: DeveloperProPDF,
  generateDOCX: async (data, colors, options) => {
    throw new Error('DOCX export not supported for two-column templates. Please use PDF export.');
  },
};

/**
 * Template 11: Software Engineer
 * Classic single-column for engineers
 * ATS Score: 90/100 (ATS-safe)
 */
export const SoftwareEngineerTemplate: ReactTemplate = {
  id: 'software-engineer',
  name: 'Software Engineer',
  metadata: SoftwareEngineerMetadata,
  PDFComponent: SoftwareEngineerPDF,
  generateDOCX: async (data, colors, options) => await generateDOCX(data, colors, { ...options, templateId: 'software-engineer' } as any),
};

/**
 * Template 12: Full Stack
 * Balanced template for full-stack devs
 * ATS Score: 88/100 (ATS-friendly)
 */
export const FullStackTemplate: ReactTemplate = {
  id: 'full-stack',
  name: 'Full Stack',
  metadata: FullStackMetadata,
  PDFComponent: FullStackPDF,
  generateDOCX: async (data, colors, options) => await generateDOCX(data, colors, { ...options, templateId: 'full-stack' } as any),
};

/**
 * Template 13: DevOps Professional
 * Professional two-column for DevOps
 * ATS Score: 82/100 (ATS-friendly, two-column)
 */
export const DevOpsProfessionalTemplate: ReactTemplate = {
  id: 'devops-professional',
  name: 'DevOps Professional',
  metadata: DevOpsProfessionalMetadata,
  PDFComponent: DevOpsProfessionalPDF,
  generateDOCX: async (data, colors, options) => {
    throw new Error('DOCX export not supported for two-column templates. Please use PDF export.');
  },
};

/**
 * Template 14: Tech Lead
 * Professional for technical leaders
 * ATS Score: 88/100 (ATS-friendly)
 */
export const TechLeadTemplate: ReactTemplate = {
  id: 'tech-lead',
  name: 'Tech Lead',
  metadata: TechLeadMetadata,
  PDFComponent: TechLeadPDF,
  generateDOCX: async (data, colors, options) => await generateDOCX(data, colors, { ...options, templateId: 'tech-lead' } as any),
};

/**
 * Template 15: Engineering Manager
 * Professional two-column for managers
 * ATS Score: 80/100 (ATS-friendly, two-column)
 */
export const EngineeringManagerTemplate: ReactTemplate = {
  id: 'engineering-manager',
  name: 'Engineering Manager',
  metadata: EngineeringManagerMetadata,
  PDFComponent: EngineeringManagerPDF,
  generateDOCX: async (data, colors, options) => {
    throw new Error('DOCX export not supported for two-column templates. Please use PDF export.');
  },
};

/**
 * Export all templates as an array
 */
export const techStartupTemplates: ReactTemplate[] = [
  DeveloperMinimalTemplate,
  TechModernTemplate,
  EngineerCleanTemplate,
  StartupBoldTemplate,
  ProductManagerTemplate,
  CodeProfessionalTemplate,
  DataScienceTemplate,
  TechExecutiveTemplate,
  StartupCasualTemplate,
  DeveloperProTemplate,
  SoftwareEngineerTemplate,
  FullStackTemplate,
  DevOpsProfessionalTemplate,
  TechLeadTemplate,
  EngineeringManagerTemplate,
];

/**
 * Default export - all templates
 */
export default techStartupTemplates;

/**
 * Template Summary:
 *
 * Single-Column Templates (DOCX Supported):
 * 1. Developer Minimal - ATS: 90
 * 2. Tech Modern - ATS: 88
 * 3. Engineer Clean - ATS: 90
 * 5. Product Manager - ATS: 88
 * 6. Code Professional - ATS: 90
 * 7. Data Science - ATS: 88
 * 8. Tech Executive - ATS: 85
 * 11. Software Engineer - ATS: 90
 * 12. Full Stack - ATS: 88
 * 14. Tech Lead - ATS: 88
 *
 * Two-Column Templates (PDF Only):
 * 4. Startup Bold - ATS: 80
 * 9. Startup Casual - ATS: 82
 * 10. Developer Pro - ATS: 82
 * 13. DevOps Professional - ATS: 82
 * 15. Engineering Manager - ATS: 80
 *
 * Average ATS Score: 85.7/100
 */
