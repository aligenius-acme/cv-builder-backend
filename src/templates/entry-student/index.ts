/**
 * Entry Level / Student Templates
 * Collection of templates optimized for students and entry-level candidates
 *
 * Features:
 * - Education-first layout
 * - Coursework and projects
 * - Internships and volunteer work
 * - Skills and activities
 * - Fresh, approachable designs
 *
 * Best for: Students, recent graduates, entry-level positions, career changers
 */

import { ReactTemplate } from '../index';

// Import all templates
import { GraduateFreshTemplate } from './GraduateFresh';
import { StudentCleanTemplate } from './StudentClean';
import { InternReadyTemplate } from './InternReady';
import { EntryProfessionalTemplate } from './EntryProfessional';
import { CareerStarterTemplate } from './CareerStarter';
import { RecentGraduateTemplate } from './RecentGraduate';
import { CollegeStudentTemplate } from './CollegeStudent';
import { FirstJobTemplate } from './FirstJob';
import { EntryLevelTemplate } from './EntryLevel';
import { CareerChangeTemplate } from './CareerChange';
import { InternshipTemplate } from './Internship';
import { JuniorProfessionalTemplate } from './JuniorProfessional';
import { NewGraduateTemplate } from './NewGraduate';
import { CareerLaunchTemplate } from './CareerLaunch';
import { FreshmanTemplate } from './Freshman';

/**
 * Entry-Level/Student Template Collection
 */
export const entryStudentTemplates: ReactTemplate[] = [
  GraduateFreshTemplate,
  StudentCleanTemplate,
  InternReadyTemplate,
  EntryProfessionalTemplate,
  CareerStarterTemplate,
  RecentGraduateTemplate,
  CollegeStudentTemplate,
  FirstJobTemplate,
  EntryLevelTemplate,
  CareerChangeTemplate,
  InternshipTemplate,
  JuniorProfessionalTemplate,
  NewGraduateTemplate,
  CareerLaunchTemplate,
  FreshmanTemplate,
];

/**
 * Export individual templates
 */
export {
  GraduateFreshTemplate,
  StudentCleanTemplate,
  InternReadyTemplate,
  EntryProfessionalTemplate,
  CareerStarterTemplate,
  RecentGraduateTemplate,
  CollegeStudentTemplate,
  FirstJobTemplate,
  EntryLevelTemplate,
  CareerChangeTemplate,
  InternshipTemplate,
  JuniorProfessionalTemplate,
  NewGraduateTemplate,
  CareerLaunchTemplate,
  FreshmanTemplate,
};

/**
 * Get template by ID
 */
export function getEntryStudentTemplate(id: string): ReactTemplate | undefined {
  return entryStudentTemplates.find(template => template.id === id);
}

/**
 * Get all template IDs
 */
export function getEntryStudentTemplateIds(): string[] {
  return entryStudentTemplates.map(template => template.id);
}

/**
 * Template metadata summary
 */
export const entryStudentTemplateInfo = {
  category: 'entry-level',
  count: entryStudentTemplates.length,
  templates: entryStudentTemplates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.metadata.description,
    atsScore: t.metadata.atsScore,
    bestFor: t.metadata.bestFor,
  })),
};

export default entryStudentTemplates;
