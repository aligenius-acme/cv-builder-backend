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
import { LayoutType, LayoutProps, LayoutMetadata } from './types';
import * as React from 'react';

/**
 * Registry of all available layout components (12 unique layouts)
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

  // Placeholders (use BaseLayout as fallback)
  BoldModernLayout: BaseLayout,
  ClassicLayout: BaseLayout,
  ContemporaryLayout: BaseLayout,
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

  // Placeholders
  BoldModernLayout: {
    id: 'BoldModernLayout',
    name: 'Bold Modern',
    description: 'Bold modern design with strong typography',
    suitableFor: ['sales-marketing', 'creative-design'],
    complexity: 'moderate',
    atsCompatibility: 'medium',
    isUnique: false,
  },
  ClassicLayout: {
    id: 'ClassicLayout',
    name: 'Classic',
    description: 'Timeless classic layout',
    suitableFor: ['all'],
    complexity: 'simple',
    atsCompatibility: 'high',
    isUnique: false,
  },
  ContemporaryLayout: {
    id: 'ContemporaryLayout',
    name: 'Contemporary',
    description: 'Contemporary modern layout',
    suitableFor: ['all'],
    complexity: 'moderate',
    atsCompatibility: 'high',
    isUnique: false,
  },
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
};
