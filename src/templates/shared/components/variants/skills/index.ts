/**
 * Skills Component Variants
 * Registry mapping variant names to components
 */

export { CompactListSkills } from './CompactListSkills';
export { ProgressBarsSkills } from './ProgressBarsSkills';
export { CategorizedSkills } from './CategorizedSkills';
export { PillSkills } from './PillSkills';
export { IconSkills } from './IconSkills';
export { TableGridSkills } from './TableGridSkills';
export { ColorCodedSkills } from './ColorCodedSkills';
export { ChipSkills } from './ChipSkills';
export { RatedSkills } from './RatedSkills';
export { TimelineSkills } from './TimelineSkills';

export const skillsVariants = {
  'compact-list': 'CompactListSkills',
  'progress-bars': 'ProgressBarsSkills',
  'categorized': 'CategorizedSkills',
  'pill': 'PillSkills',
  'icon': 'IconSkills',
  'table-grid': 'TableGridSkills',
  'color-coded': 'ColorCodedSkills',
  'chip': 'ChipSkills',
  'rated': 'RatedSkills',
  'timeline': 'TimelineSkills',
} as const;

export type SkillsVariant = keyof typeof skillsVariants;
