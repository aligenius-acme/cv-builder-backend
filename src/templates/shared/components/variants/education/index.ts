/**
 * Education Component Variants
 * Registry mapping variant names to components
 */

export { DetailedEducation } from './DetailedEducation';
export { MinimalistEducation } from './MinimalistEducation';
export { TimelineEducation } from './TimelineEducation';
export { CardEducation } from './CardEducation';
export { TwoColumnEducation } from './TwoColumnEducation';
export { CompactEducation } from './CompactEducation';
export { IconEducation } from './IconEducation';
export { BadgeEducation } from './BadgeEducation';

export const educationVariants = {
  'detailed': 'DetailedEducation',
  'minimalist': 'MinimalistEducation',
  'timeline': 'TimelineEducation',
  'card': 'CardEducation',
  'two-column': 'TwoColumnEducation',
  'compact': 'CompactEducation',
  'icon': 'IconEducation',
  'badge': 'BadgeEducation',
} as const;

export type EducationVariant = keyof typeof educationVariants;
