/**
 * Experience Component Variants
 * Registry mapping variant names to components
 */

export { BulletPointExperience } from './BulletPointExperience';
export { TimelineLeftExperience } from './TimelineLeftExperience';
export { MetricsFocusedExperience } from './MetricsFocusedExperience';
export { CardLayoutExperience } from './CardLayoutExperience';
export { TwoColumnExperience } from './TwoColumnExperience';
export { CompactListExperience } from './CompactListExperience';
export { IconBasedExperience } from './IconBasedExperience';
export { SkillsTaggedExperience } from './SkillsTaggedExperience';
export { GridLayoutExperience } from './GridLayoutExperience';
export { SidebarDatesExperience } from './SidebarDatesExperience';
export { ProjectHighlightExperience } from './ProjectHighlightExperience';
export { AchievementBoxesExperience } from './AchievementBoxesExperience';

export const experienceVariants = {
  'bullet-point': 'BulletPointExperience',
  'timeline-left': 'TimelineLeftExperience',
  'metrics-focused': 'MetricsFocusedExperience',
  'card-layout': 'CardLayoutExperience',
  'two-column': 'TwoColumnExperience',
  'compact-list': 'CompactListExperience',
  'icon-based': 'IconBasedExperience',
  'skills-tagged': 'SkillsTaggedExperience',
  'grid-layout': 'GridLayoutExperience',
  'sidebar-dates': 'SidebarDatesExperience',
  'project-highlight': 'ProjectHighlightExperience',
  'achievement-boxes': 'AchievementBoxesExperience',
} as const;

export type ExperienceVariant = keyof typeof experienceVariants;
