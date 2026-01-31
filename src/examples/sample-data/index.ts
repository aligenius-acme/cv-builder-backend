/**
 * Sample Resume Data Index
 * Exports all sample data for preview generation
 */

export { techSampleData } from './tech-sample';
export { executiveSampleData } from './executive-sample';
export { academicSampleData } from './academic-sample';
export { creativeSampleData } from './creative-sample';
export { entryLevelSampleData } from './entry-level-sample';
export { professionalSampleData } from './professional-sample';

import { ParsedResumeData } from '../../types';
import { techSampleData } from './tech-sample';
import { executiveSampleData } from './executive-sample';
import { academicSampleData } from './academic-sample';
import { creativeSampleData } from './creative-sample';
import { entryLevelSampleData } from './entry-level-sample';
import { professionalSampleData } from './professional-sample';

/**
 * Map of category to sample data
 */
export const sampleDataByCategory: Record<string, ParsedResumeData> = {
  'tech-startup': techSampleData,
  'technical': techSampleData,
  'executive': executiveSampleData,
  'executive-leadership': executiveSampleData,
  'academic': academicSampleData,
  'academic-research': academicSampleData,
  'creative': creativeSampleData,
  'creative-design': creativeSampleData,
  'entry-level': entryLevelSampleData,
  'entry-student': entryLevelSampleData,
  'professional': professionalSampleData,
  'ats-professional': professionalSampleData,
};

/**
 * Get sample data for a specific category
 * Falls back to professional sample if category not found
 */
export function getSampleDataForCategory(category: string): ParsedResumeData {
  return sampleDataByCategory[category] || professionalSampleData;
}

/**
 * Get all sample data
 */
export function getAllSampleData(): ParsedResumeData[] {
  return [
    techSampleData,
    executiveSampleData,
    academicSampleData,
    creativeSampleData,
    entryLevelSampleData,
    professionalSampleData,
  ];
}
