/**
 * React DOCX Generator Service
 *
 * Generates DOCX files from template-specific generateDOCX functions
 * This service dynamically imports template modules and executes their DOCX generation logic
 */

import { Packer } from 'docx';
import { ParsedResumeData } from '../types';
import { getTemplateConfig, ExtendedTemplateConfig } from './templates';

/**
 * Color configuration for DOCX templates
 */
export interface DOCXColorConfig {
  primary: string;
  secondary?: string;
  accent?: string;
  text?: string;
  muted?: string;
  background?: string;
}

/**
 * Template DOCX generator function signature
 */
export interface TemplateDOCXGenerator {
  generateDOCX: (
    data: ParsedResumeData,
    colors: DOCXColorConfig,
    templateConfig: ExtendedTemplateConfig
  ) => Promise<any>; // Returns docx Document instance
}

/**
 * Generate DOCX from a React template
 *
 * @param templateId - Template identifier (e.g., 'ats-professional-navy')
 * @param resumeData - Parsed resume data
 * @param colors - Optional color overrides
 * @returns Promise<Buffer> - DOCX file buffer
 */
export async function generateDOCXFromReact(
  templateId: string,
  resumeData: ParsedResumeData,
  colors?: DOCXColorConfig
): Promise<Buffer> {
  try {
    // Get template configuration
    const templateConfig = getTemplateConfig(templateId);

    // Extract layout ID from template ID (format: layoutId-colorId)
    const layoutId = extractLayoutId(templateId);

    // Default colors from template config
    const colorConfig: DOCXColorConfig = {
      primary: colors?.primary ?? templateConfig.primaryColor,
      secondary: colors?.secondary ?? templateConfig.secondaryColor,
      accent: colors?.accent ?? templateConfig.accentColor,
      text: colors?.text ?? templateConfig.textColor,
      muted: colors?.muted ?? templateConfig.mutedColor,
      background: colors?.background ?? templateConfig.backgroundColor,
    };

    // Import the template's DOCX generator
    const templateModule = await importTemplateDOCXGenerator(layoutId);

    if (!templateModule || typeof templateModule.generateDOCX !== 'function') {
      throw new Error(`Template '${layoutId}' does not export a generateDOCX function`);
    }

    // Execute the template's generateDOCX function
    const document = await templateModule.generateDOCX(resumeData, colorConfig, templateConfig);

    if (!document) {
      throw new Error(`Template '${layoutId}' generateDOCX returned null or undefined`);
    }

    // Pack the Document to a buffer
    const buffer = await Packer.toBuffer(document);

    return buffer;
  } catch (error) {
    console.error('Error generating DOCX from React template:', error);
    throw new Error(
      `Failed to generate DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract layout ID from template variant ID
 * Template ID format: layoutId-colorId (e.g., 'ats-professional-navy')
 */
function extractLayoutId(templateId: string): string {
  // Split by last dash to separate layout from color
  const parts = templateId.split('-');

  // Known color IDs to identify and remove
  const colorIds = [
    'navy', 'ocean', 'royal', 'slate',
    'emerald', 'forest', 'teal',
    'burgundy', 'rust', 'wine',
    'charcoal', 'graphite', 'stone',
    'violet', 'indigo', 'plum',
  ];

  // Check if last part is a color ID
  const lastPart = parts[parts.length - 1];
  if (colorIds.includes(lastPart)) {
    // Remove color ID, return layout ID
    return parts.slice(0, -1).join('-');
  }

  // If no known color, return original (might be a simple layout ID)
  return templateId;
}

/**
 * Dynamically import the template's DOCX generator module
 */
async function importTemplateDOCXGenerator(layoutId: string): Promise<TemplateDOCXGenerator | null> {
  try {
    // Try to import from templates/{layoutId}/generateDOCX.ts
    const modulePath = `../templates/${layoutId}/generateDOCX`;

    const module = await import(modulePath);
    return module as TemplateDOCXGenerator;
  } catch (error) {
    // If specific template not found, try fallback to default
    console.warn(`Template '${layoutId}' DOCX generator not found, attempting fallback`);

    try {
      // Try a generic/default DOCX generator
      const fallbackModule = await import('../templates/ats-professional/generateDOCX');
      return fallbackModule as TemplateDOCXGenerator;
    } catch (fallbackError) {
      console.error(`Fallback DOCX generator also failed:`, fallbackError);
      return null;
    }
  }
}

/**
 * Validate resume data before generating DOCX
 */
export function validateResumeData(data: ParsedResumeData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!data.contact) {
    errors.push('Contact information is required');
  }

  if (!data.contact.name) {
    errors.push('Contact name is required');
  }

  if (!data.experience || data.experience.length === 0) {
    errors.push('At least one experience entry is required');
  }

  if (!data.education || data.education.length === 0) {
    errors.push('At least one education entry is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get supported template IDs that have DOCX generators
 */
export function getSupportedDOCXTemplates(): string[] {
  return [
    'ats-professional',
    'tech-startup',
    'creative-design',
    'academic-research',
    'entry-student',
    'executive-leadership',
  ];
}

/**
 * Check if a template supports DOCX generation
 */
export function templateSupportsDOCX(templateId: string): boolean {
  const layoutId = extractLayoutId(templateId);
  return getSupportedDOCXTemplates().includes(layoutId);
}

/**
 * Generate DOCX with performance tracking
 */
export async function generateDOCXWithMetrics(
  templateId: string,
  resumeData: ParsedResumeData,
  colors?: DOCXColorConfig
): Promise<{ buffer: Buffer; generationTime: number }> {
  const startTime = Date.now();

  const buffer = await generateDOCXFromReact(templateId, resumeData, colors);

  const generationTime = Date.now() - startTime;

  // Log warning if generation takes too long (>3 seconds as per requirements)
  if (generationTime > 3000) {
    console.warn(
      `DOCX generation took ${generationTime}ms for template '${templateId}' (exceeds 3s target)`
    );
  }

  return {
    buffer,
    generationTime,
  };
}
