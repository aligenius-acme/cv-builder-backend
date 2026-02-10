/**
 * Header Component Variants
 * Registry mapping variant names to components
 */

export { MinimalHeader } from './MinimalHeader';
export { BoldModernHeader } from './BoldModernHeader';
export { ProfessionalFormalHeader } from './ProfessionalFormalHeader';
export { TwoColumnHeader } from './TwoColumnHeader';
export { IconDecoratedHeader } from './IconDecoratedHeader';
export { GradientBackgroundHeader } from './GradientBackgroundHeader';
export { CompactSingleLineHeader } from './CompactSingleLineHeader';
export { PhotoProminentHeader } from './PhotoProminentHeader';
export { SplitLayoutHeader } from './SplitLayoutHeader';
export { UnderlinedHeader } from './UnderlinedHeader';
export { SidebarContactHeader } from './SidebarContactHeader';
export { ExecutiveSignatureHeader } from './ExecutiveSignatureHeader';

export const headerVariants = {
  'minimal': 'MinimalHeader',
  'bold-modern': 'BoldModernHeader',
  'professional-formal': 'ProfessionalFormalHeader',
  'two-column': 'TwoColumnHeader',
  'icon-decorated': 'IconDecoratedHeader',
  'gradient-background': 'GradientBackgroundHeader',
  'compact-single-line': 'CompactSingleLineHeader',
  'photo-prominent': 'PhotoProminentHeader',
  'split-layout': 'SplitLayoutHeader',
  'underlined': 'UnderlinedHeader',
  'sidebar-contact': 'SidebarContactHeader',
  'executive-signature': 'ExecutiveSignatureHeader',
} as const;

export type HeaderVariant = keyof typeof headerVariants;
