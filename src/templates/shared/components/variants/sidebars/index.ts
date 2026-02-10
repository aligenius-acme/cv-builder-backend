/**
 * Sidebar Component Variants
 * Registry mapping variant names to components
 */

export { ContactSidebar } from './ContactSidebar';
export { SkillsSidebar } from './SkillsSidebar';
export { ProfileSidebar } from './ProfileSidebar';
export { IconContactSidebar } from './IconContactSidebar';
export { ColoredSidebar } from './ColoredSidebar';
export { MinimalistSidebar } from './MinimalistSidebar';

export const sidebarVariants = {
  'contact': 'ContactSidebar',
  'skills': 'SkillsSidebar',
  'profile': 'ProfileSidebar',
  'icon-contact': 'IconContactSidebar',
  'colored': 'ColoredSidebar',
  'minimalist': 'MinimalistSidebar',
} as const;

export type SidebarVariant = keyof typeof sidebarVariants;
