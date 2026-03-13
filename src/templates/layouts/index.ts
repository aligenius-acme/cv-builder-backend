/**
 * Layout Registry
 * Exports all layout components and provides utilities for layout management
 */

import { BaseLayout, metadata as baseMetadata } from './BaseLayout';
import { TwoColumnSidebarLayout, metadata as twoColumnMetadata } from './TwoColumnSidebarLayout';
import { ModernMinimalLayout, metadata as modernMinimalMetadata } from './ModernMinimalLayout';
import { ExecutiveLayout, metadata as executiveMetadata } from './ExecutiveLayout';
import { CreativeLayout, metadata as creativeMetadata } from './CreativeLayout';
import { TimelineLayout, metadata as timelineMetadata } from './TimelineLayout';
import { CompactLayout, metadata as compactMetadata } from './CompactLayout';
import { TechLayout, metadata as techMetadata } from './TechLayout';
import { AcademicLayout, metadata as academicMetadata } from './AcademicLayout';
import { PortfolioLayout, metadata as portfolioMetadata } from './PortfolioLayout';
import { ProfessionalLayout, metadata as professionalMetadata } from './ProfessionalLayout';
import { InfographicLayout, metadata as infographicMetadata } from './InfographicLayout';
import { BoldModernLayout, metadata as boldModernMetadata } from './BoldModernLayout';
import { ClassicLayout, metadata as classicMetadata } from './ClassicLayout';
import { ContemporaryLayout, metadata as contemporaryMetadata } from './ContemporaryLayout';
import { SplitPanelLayout, metadata as splitPanelMetadata } from './SplitPanelLayout';
import { RuledElegantLayout, metadata as ruledElegantMetadata } from './RuledElegantLayout';
import { TopAccentLayout, metadata as topAccentMetadata } from './TopAccentLayout';
import { ColumnSplitLayout, metadata as columnSplitMetadata } from './ColumnSplitLayout';
import { BorderedPageLayout, metadata as borderedPageMetadata } from './BorderedPageLayout';
import { DarkModeLayout, metadata as darkModeMetadata } from './DarkModeLayout';
import { DiagonalHeroLayout, metadata as diagonalHeroMetadata } from './DiagonalHeroLayout';
import { MagazineLayout, metadata as magazineMetadata } from './MagazineLayout';
import { HighlightBandLayout, metadata as highlightBandMetadata } from './HighlightBandLayout';
import { StackedCardsLayout, metadata as stackedCardsMetadata } from './StackedCardsLayout';
import { MonogramLayout, metadata as monogramMetadata } from './MonogramLayout';
import { TimelineDotsLayout, metadata as timelineDotsMetadata } from './TimelineDotsLayout';
import { CompactTableLayout, metadata as compactTableMetadata } from './CompactTableLayout';
import { LayoutType, LayoutProps, LayoutMetadata } from './types';
import * as React from 'react';

/**
 * Registry of all available layout components (28 layouts)
 */
export const LAYOUT_REGISTRY: Record<LayoutType, React.FC<LayoutProps>> = {
  // Original 5 layouts
  BaseLayout,
  TwoColumnSidebarLayout,
  ModernMinimalLayout,
  ExecutiveLayout,
  CreativeLayout,

  // 7 new layouts
  TimelineLayout,
  CompactLayout,
  TechLayout,
  AcademicLayout,
  PortfolioLayout,
  ProfessionalLayout,
  InfographicLayout,

  // 3 additional unique layouts
  BoldModernLayout,
  ClassicLayout,
  ContemporaryLayout,

  // 5 new distinct layouts
  SplitPanelLayout,
  RuledElegantLayout,
  TopAccentLayout,
  ColumnSplitLayout,
  BorderedPageLayout,

  // 8 new layouts
  DarkModeLayout,
  DiagonalHeroLayout,
  MagazineLayout,
  HighlightBandLayout,
  StackedCardsLayout,
  MonogramLayout,
  TimelineDotsLayout,
  CompactTableLayout,
};

/**
 * Metadata for all layouts
 */
export const LAYOUT_METADATA: Record<LayoutType, LayoutMetadata> = {
  // Original 5 layouts
  BaseLayout: baseMetadata,
  TwoColumnSidebarLayout: twoColumnMetadata,
  ModernMinimalLayout: modernMinimalMetadata,
  ExecutiveLayout: executiveMetadata,
  CreativeLayout: creativeMetadata,

  // 7 new layouts
  TimelineLayout: timelineMetadata,
  CompactLayout: compactMetadata,
  TechLayout: techMetadata,
  AcademicLayout: academicMetadata,
  PortfolioLayout: portfolioMetadata,
  ProfessionalLayout: professionalMetadata,
  InfographicLayout: infographicMetadata,

  // 3 new unique layouts
  BoldModernLayout: boldModernMetadata,
  ClassicLayout: classicMetadata,
  ContemporaryLayout: contemporaryMetadata,

  // 5 new distinct layouts
  SplitPanelLayout: splitPanelMetadata,
  RuledElegantLayout: ruledElegantMetadata,
  TopAccentLayout: topAccentMetadata,
  ColumnSplitLayout: columnSplitMetadata,
  BorderedPageLayout: borderedPageMetadata,

  // 8 new layouts
  DarkModeLayout: darkModeMetadata,
  DiagonalHeroLayout: diagonalHeroMetadata,
  MagazineLayout: magazineMetadata,
  HighlightBandLayout: highlightBandMetadata,
  StackedCardsLayout: stackedCardsMetadata,
  MonogramLayout: monogramMetadata,
  TimelineDotsLayout: timelineDotsMetadata,
  CompactTableLayout: compactTableMetadata,
};

/**
 * Get a layout component by type
 * Falls back to BaseLayout if layout type not found
 */
export function getLayoutComponent(layoutType?: LayoutType | string): React.FC<LayoutProps> {
  if (!layoutType) {
    return BaseLayout;
  }

  return LAYOUT_REGISTRY[layoutType as LayoutType] || BaseLayout;
}

/**
 * Get layout metadata by type
 */
export function getLayoutMetadata(layoutType?: LayoutType | string): LayoutMetadata {
  if (!layoutType) {
    return baseMetadata;
  }

  return LAYOUT_METADATA[layoutType as LayoutType] || baseMetadata;
}

/**
 * Get all unique layouts (excluding aliases/placeholders)
 */
export function getUniqueLayouts(): LayoutMetadata[] {
  return Object.values(LAYOUT_METADATA).filter(meta => meta.isUnique);
}

/**
 * Get layouts suitable for a category
 */
export function getLayoutsForCategory(category: string): LayoutMetadata[] {
  return Object.values(LAYOUT_METADATA).filter(
    meta => meta.suitableFor.includes('all') || meta.suitableFor.includes(category)
  );
}

// Export types
export type { LayoutProps, LayoutType, LayoutMetadata };

// Export all layouts
export {
  BaseLayout,
  TwoColumnSidebarLayout,
  ModernMinimalLayout,
  ExecutiveLayout,
  CreativeLayout,
  TimelineLayout,
  CompactLayout,
  TechLayout,
  AcademicLayout,
  PortfolioLayout,
  ProfessionalLayout,
  InfographicLayout,
  BoldModernLayout,
  ClassicLayout,
  ContemporaryLayout,
  SplitPanelLayout,
  RuledElegantLayout,
  TopAccentLayout,
  ColumnSplitLayout,
  BorderedPageLayout,
  DarkModeLayout,
  DiagonalHeroLayout,
  MagazineLayout,
  HighlightBandLayout,
  StackedCardsLayout,
  MonogramLayout,
  TimelineDotsLayout,
  CompactTableLayout,
};
