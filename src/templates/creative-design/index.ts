/**
 * Creative & Design Templates Category
 * 15 bold, visually striking templates for creative professionals
 *
 * This module contains templates designed for:
 * - Graphic Designers & Visual Designers
 * - UX/UI Designers
 * - Creative Directors & Art Directors
 * - Brand Designers & Managers
 * - Marketing Creatives
 * - Content Creators & Social Media Professionals
 * - Media Professionals
 *
 * All templates feature:
 * - Bold, creative layouts (two-column or banner header styles)
 * - Strong use of color and visual hierarchy
 * - Portfolio/project emphasis
 * - Creative typography
 * - Visual-first design (ATS: 60-75%)
 *
 * Layout Types:
 * - Two-Column with Sidebar (Templates 1-7): Colored sidebars, bold visual impact
 * - Banner Header with Single-Column (Templates 8-15): Better ATS compatibility
 *
 * DOCX Support:
 * - Banner header templates (8-15): DOCX supported for simpler layouts
 * - Two-column templates (1-7): PDF-only due to complex visual design
 */

import { ReactTemplate } from '../index';
import { generateDOCX, supportsDOCX } from './generateDOCX';

// Import all template components
import DesignerBoldPDF, { DesignerBoldMetadata } from './DesignerBold';
import CreativePortfolioPDF, { CreativePortfolioMetadata } from './CreativePortfolio';
import MarketingDynamicPDF, { MarketingDynamicMetadata } from './MarketingDynamic';
import MediaProPDF, { MediaProMetadata } from './MediaPro';
import BrandShowcasePDF, { BrandShowcaseMetadata } from './BrandShowcase';
import UXPortfolioPDF, { UXPortfolioMetadata } from './UXPortfolio';
import GraphicDesignerPDF, { GraphicDesignerMetadata } from './GraphicDesigner';
import CreativeDirectorPDF, { CreativeDirectorMetadata } from './CreativeDirector';
import BrandManagerPDF, { BrandManagerMetadata } from './BrandManager';
import DesignLeadPDF, { DesignLeadMetadata } from './DesignLead';
import MarketingCreativePDF, { MarketingCreativeMetadata } from './MarketingCreative';
import ContentCreatorPDF, { ContentCreatorMetadata } from './ContentCreator';
import SocialMediaProPDF, { SocialMediaProMetadata } from './SocialMediaPro';
import DigitalDesignerPDF, { DigitalDesignerMetadata } from './DigitalDesigner';
import ArtDirectorPDF, { ArtDirectorMetadata } from './ArtDirector';

/**
 * Template 1: Designer Bold
 * Two-column with bold colored sidebar
 * ATS Score: 70/100 (visual-first)
 */
export const DesignerBoldTemplate: ReactTemplate = {
  id: 'designer-bold',
  name: 'Designer Bold',
  metadata: DesignerBoldMetadata,
  PDFComponent: DesignerBoldPDF,
  generateDOCX: async (data, colors, options) => {
    throw new Error('DOCX export not supported for two-column templates. Please use PDF export.');
  },
};

/**
 * Template 2: Creative Portfolio
 * Portfolio-focused with strong visual emphasis
 * ATS Score: 65/100 (visual-first)
 */
export const CreativePortfolioTemplate: ReactTemplate = {
  id: 'creative-portfolio',
  name: 'Creative Portfolio',
  metadata: CreativePortfolioMetadata,
  PDFComponent: CreativePortfolioPDF,
  generateDOCX: async (data, colors, options) => {
    throw new Error('DOCX export not supported for two-column templates. Please use PDF export.');
  },
};

/**
 * Template 3: Marketing Dynamic
 * Dynamic two-column for marketing roles
 * ATS Score: 72/100 (visual-first)
 */
export const MarketingDynamicTemplate: ReactTemplate = {
  id: 'marketing-dynamic',
  name: 'Marketing Dynamic',
  metadata: MarketingDynamicMetadata,
  PDFComponent: MarketingDynamicPDF,
  generateDOCX: async (data, colors, options) => {
    throw new Error('DOCX export not supported for two-column templates. Please use PDF export.');
  },
};

/**
 * Template 4: Media Pro
 * Professional media template with dark sidebar
 * ATS Score: 68/100 (visual-first)
 */
export const MediaProTemplate: ReactTemplate = {
  id: 'media-pro',
  name: 'Media Pro',
  metadata: MediaProMetadata,
  PDFComponent: MediaProPDF,
  generateDOCX: async (data, colors, options) => {
    throw new Error('DOCX export not supported for two-column templates. Please use PDF export.');
  },
};

/**
 * Template 5: Brand Showcase
 * Bold brand-focused template
 * ATS Score: 70/100 (visual-first)
 */
export const BrandShowcaseTemplate: ReactTemplate = {
  id: 'brand-showcase',
  name: 'Brand Showcase',
  metadata: BrandShowcaseMetadata,
  PDFComponent: BrandShowcasePDF,
  generateDOCX: async (data, colors, options) => {
    throw new Error('DOCX export not supported for two-column templates. Please use PDF export.');
  },
};

/**
 * Template 6: UX Portfolio
 * Clean, professional UX designer template
 * ATS Score: 75/100 (balanced)
 */
export const UXPortfolioTemplate: ReactTemplate = {
  id: 'ux-portfolio',
  name: 'UX Portfolio',
  metadata: UXPortfolioMetadata,
  PDFComponent: UXPortfolioPDF,
  generateDOCX: async (data, colors, options) => {
    throw new Error('DOCX export not supported for two-column templates. Please use PDF export.');
  },
};

/**
 * Template 7: Graphic Designer
 * Bold visual template with maximum impact
 * ATS Score: 65/100 (visual-first)
 */
export const GraphicDesignerTemplate: ReactTemplate = {
  id: 'graphic-designer',
  name: 'Graphic Designer',
  metadata: GraphicDesignerMetadata,
  PDFComponent: GraphicDesignerPDF,
  generateDOCX: async (data, colors, options) => {
    throw new Error('DOCX export not supported for two-column templates. Please use PDF export.');
  },
};

/**
 * Template 8: Creative Director
 * Executive creative style with banner header
 * ATS Score: 72/100 (balanced) - DOCX Supported
 */
export const CreativeDirectorTemplate: ReactTemplate = {
  id: 'creative-director',
  name: 'Creative Director',
  metadata: CreativeDirectorMetadata,
  PDFComponent: CreativeDirectorPDF,
  generateDOCX: async (data, colors, options) =>
    await generateDOCX(data, colors, { ...options, templateId: 'creative-director' } as any),
};

/**
 * Template 9: Brand Manager
 * Professional with banner header
 * ATS Score: 75/100 (balanced) - DOCX Supported
 */
export const BrandManagerTemplate: ReactTemplate = {
  id: 'brand-manager',
  name: 'Brand Manager',
  metadata: BrandManagerMetadata,
  PDFComponent: BrandManagerPDF,
  generateDOCX: async (data, colors, options) =>
    await generateDOCX(data, colors, { ...options, templateId: 'brand-manager' } as any),
};

/**
 * Template 10: Design Lead
 * Leadership-focused design template
 * ATS Score: 73/100 (balanced) - DOCX Supported
 */
export const DesignLeadTemplate: ReactTemplate = {
  id: 'design-lead',
  name: 'Design Lead',
  metadata: DesignLeadMetadata,
  PDFComponent: DesignLeadPDF,
  generateDOCX: async (data, colors, options) =>
    await generateDOCX(data, colors, { ...options, templateId: 'design-lead' } as any),
};

/**
 * Template 11: Marketing Creative
 * Dynamic marketing focus
 * ATS Score: 70/100 (balanced) - DOCX Supported
 */
export const MarketingCreativeTemplate: ReactTemplate = {
  id: 'marketing-creative',
  name: 'Marketing Creative',
  metadata: MarketingCreativeMetadata,
  PDFComponent: MarketingCreativePDF,
  generateDOCX: async (data, colors, options) =>
    await generateDOCX(data, colors, { ...options, templateId: 'marketing-creative' } as any),
};

/**
 * Template 12: Content Creator
 * Modern content creator style
 * ATS Score: 68/100 (visual-first) - DOCX Supported
 */
export const ContentCreatorTemplate: ReactTemplate = {
  id: 'content-creator',
  name: 'Content Creator',
  metadata: ContentCreatorMetadata,
  PDFComponent: ContentCreatorPDF,
  generateDOCX: async (data, colors, options) =>
    await generateDOCX(data, colors, { ...options, templateId: 'content-creator' } as any),
};

/**
 * Template 13: Social Media Pro
 * Social media professional design
 * ATS Score: 67/100 (visual-first)
 */
export const SocialMediaProTemplate: ReactTemplate = {
  id: 'social-media-pro',
  name: 'Social Media Pro',
  metadata: SocialMediaProMetadata,
  PDFComponent: SocialMediaProPDF,
  generateDOCX: async (data, colors, options) => {
    throw new Error('DOCX export not supported for this template. Please use PDF export.');
  },
};

/**
 * Template 14: Digital Designer
 * Digital design focused
 * ATS Score: 70/100 (balanced) - DOCX Supported
 */
export const DigitalDesignerTemplate: ReactTemplate = {
  id: 'digital-designer',
  name: 'Digital Designer',
  metadata: DigitalDesignerMetadata,
  PDFComponent: DigitalDesignerPDF,
  generateDOCX: async (data, colors, options) =>
    await generateDOCX(data, colors, { ...options, templateId: 'digital-designer' } as any),
};

/**
 * Template 15: Art Director
 * High-level creative leadership
 * ATS Score: 72/100 (balanced) - DOCX Supported
 */
export const ArtDirectorTemplate: ReactTemplate = {
  id: 'art-director',
  name: 'Art Director',
  metadata: ArtDirectorMetadata,
  PDFComponent: ArtDirectorPDF,
  generateDOCX: async (data, colors, options) =>
    await generateDOCX(data, colors, { ...options, templateId: 'art-director' } as any),
};

/**
 * Export all templates as an array
 */
export const creativeDesignTemplates: ReactTemplate[] = [
  DesignerBoldTemplate,
  CreativePortfolioTemplate,
  MarketingDynamicTemplate,
  MediaProTemplate,
  BrandShowcaseTemplate,
  UXPortfolioTemplate,
  GraphicDesignerTemplate,
  CreativeDirectorTemplate,
  BrandManagerTemplate,
  DesignLeadTemplate,
  MarketingCreativeTemplate,
  ContentCreatorTemplate,
  SocialMediaProTemplate,
  DigitalDesignerTemplate,
  ArtDirectorTemplate,
];

/**
 * Category metadata
 */
export const creativeDesignCategoryMetadata = {
  categoryName: 'Creative & Design',
  categoryDescription: 'Bold, visually striking templates for creative professionals',
  templateCount: 15,
  avgATSScore: 70.1,
  atsRange: '60-75%',
  designStyle: 'bold, modern, visual-first',
  bestFor: [
    'Designers',
    'Creative Directors',
    'UX/UI Designers',
    'Brand Managers',
    'Marketing Creatives',
    'Content Creators',
    'Social Media Professionals',
    'Media Professionals',
  ],
  features: {
    boldDesign: true,
    colorCustomization: true,
    portfolioEmphasis: true,
    visualHierarchy: true,
    twoColumnLayouts: 7, // Templates 1-7
    bannerHeaders: 8, // Templates 8-15
    docxSupport: 7, // Banner header templates
  },
  layoutTypes: [
    {
      type: 'Two-Column with Sidebar',
      templates: [1, 2, 3, 4, 5, 6, 7],
      description: 'Bold colored sidebars with main content area',
      docxSupport: false,
    },
    {
      type: 'Banner Header with Single-Column',
      templates: [8, 9, 10, 11, 12, 13, 14, 15],
      description: 'Bold header banner with single-column body for better ATS',
      docxSupport: true,
    },
  ],
};

/**
 * Get template by ID
 */
export function getCreativeDesignTemplate(templateId: string): ReactTemplate | undefined {
  return creativeDesignTemplates.find((template) => template.id === templateId);
}

/**
 * Get templates by role/industry
 */
export function getTemplatesByRole(role: string): ReactTemplate[] {
  return creativeDesignTemplates.filter((template) =>
    template.metadata.bestFor.some((bestFor) =>
      bestFor.toLowerCase().includes(role.toLowerCase())
    )
  );
}

/**
 * Get templates by ATS score threshold
 */
export function getTemplatesByATSScore(minScore: number): ReactTemplate[] {
  return creativeDesignTemplates.filter((template) => template.metadata.atsScore >= minScore);
}

/**
 * Get templates that support DOCX export
 */
export function getDOCXSupportedTemplates(): ReactTemplate[] {
  return creativeDesignTemplates.filter((template) => supportsDOCX(template.id));
}

/**
 * Get templates by layout type
 */
export function getTemplatesByLayout(layoutType: 'two-column' | 'banner-header'): ReactTemplate[] {
  if (layoutType === 'two-column') {
    return creativeDesignTemplates.slice(0, 7); // Templates 1-7
  } else {
    return creativeDesignTemplates.slice(7); // Templates 8-15
  }
}

/**
 * Default export - all templates
 */
export default creativeDesignTemplates;

/**
 * Template Summary:
 *
 * Two-Column Templates (PDF Only):
 * 1. Designer Bold - ATS: 70
 * 2. Creative Portfolio - ATS: 65
 * 3. Marketing Dynamic - ATS: 72
 * 4. Media Pro - ATS: 68
 * 5. Brand Showcase - ATS: 70
 * 6. UX Portfolio - ATS: 75
 * 7. Graphic Designer - ATS: 65
 *
 * Banner Header Templates (DOCX Supported):
 * 8. Creative Director - ATS: 72
 * 9. Brand Manager - ATS: 75
 * 10. Design Lead - ATS: 73
 * 11. Marketing Creative - ATS: 70
 * 12. Content Creator - ATS: 68
 * 13. Social Media Pro - ATS: 67 (PDF only)
 * 14. Digital Designer - ATS: 70
 * 15. Art Director - ATS: 72
 *
 * Average ATS Score: 70.1/100
 * DOCX Support: 7 templates (Banner header layouts)
 * Best For: Creative professionals, designers, marketing, media roles
 */
