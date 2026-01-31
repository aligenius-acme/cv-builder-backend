import { ParsedResumeData, AnonymizationConfig } from '../types';
import { ExtendedTemplateConfig } from './templates';
export declare function anonymizeResumeData(data: ParsedResumeData, config: AnonymizationConfig): ParsedResumeData;
export declare function generatePDF(data: ParsedResumeData, template: ExtendedTemplateConfig): Promise<Buffer>;
export declare function generateDOCX(data: ParsedResumeData, template: ExtendedTemplateConfig): Promise<Buffer>;
/**
 * Generate DOCX using template-specific generators (Module 4 - React DOCX)
 * Falls back to legacy generateDOCX if template doesn't have a custom generator
 */
export declare function generateDOCXEnhanced(data: ParsedResumeData, templateId: string, template?: ExtendedTemplateConfig): Promise<Buffer>;
export declare function generateCoverLetterPDF(content: string, candidateName: string, companyName: string, jobTitle: string): Promise<Buffer>;
export declare function generateCoverLetterDOCX(content: string, candidateName: string, companyName: string, jobTitle: string): Promise<Buffer>;
//# sourceMappingURL=documents.d.ts.map