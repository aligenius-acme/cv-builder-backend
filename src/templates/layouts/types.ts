/**
 * Common types and interfaces for all layout components
 */

import { ParsedResumeData } from '../../types';
import { ExtendedTemplateConfig } from '../../services/templates';

/**
 * Base props that all layout components must accept
 */
export interface LayoutProps {
  /** Resume data to render */
  data: ParsedResumeData;
  /** Template configuration including colors, fonts, styles */
  config: ExtendedTemplateConfig;
}

/**
 * Available layout components
 */
export type LayoutType =
  | 'BaseLayout'
  | 'InfographicLayout'
  | 'TimelineLayout'
  | 'ModernMinimalLayout'
  | 'CreativeLayout'
  | 'ExecutiveLayout'
  | 'TechLayout'
  | 'TwoColumnSidebarLayout'
  | 'CompactLayout'
  | 'PortfolioLayout'
  | 'ProfessionalLayout'
  | 'AcademicLayout'
  | 'BoldModernLayout'
  | 'ClassicLayout'
  | 'ContemporaryLayout'
  | 'SplitPanelLayout'
  | 'RuledElegantLayout'
  | 'TopAccentLayout'
  | 'ColumnSplitLayout'
  | 'BorderedPageLayout'
  | 'DarkModeLayout'
  | 'DiagonalHeroLayout'
  | 'MagazineLayout'
  | 'HighlightBandLayout'
  | 'StackedCardsLayout'
  | 'MonogramLayout'
  | 'TimelineDotsLayout'
  | 'CompactTableLayout';

/**
 * Layout metadata for organizing and categorizing layouts
 */
export interface LayoutMetadata {
  /** Unique layout identifier */
  id: LayoutType;
  /** Display name for the layout */
  name: string;
  /** Description of the layout's visual style */
  description: string;
  /** Best suited categories */
  suitableFor: string[];
  /** Visual complexity level */
  complexity: 'simple' | 'moderate' | 'complex';
  /** ATS compatibility rating */
  atsCompatibility: 'high' | 'medium' | 'low';
  /** Whether layout has distinct visual structure */
  isUnique: boolean;
}
