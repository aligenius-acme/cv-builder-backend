/**
 * Template Configuration Types
 * Defines the structure for modular template assembly
 */

import { HeaderVariant } from '../components/variants/headers';
import { ExperienceVariant } from '../components/variants/experience';
import { SkillsVariant } from '../components/variants/skills';
import { EducationVariant } from '../components/variants/education';
import { SidebarVariant } from '../components/variants/sidebars';

export type LayoutType = 'single-column' | 'two-column-left' | 'two-column-right';

export interface ComponentConfig {
  header: HeaderVariant;
  experience: ExperienceVariant;
  skills: SkillsVariant;
  education: EducationVariant;
  sidebar?: SidebarVariant;
}

export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  muted: string;
  background: string;
}

export interface FontConfig {
  headingFont: 'serif' | 'sans' | 'mono' | 'display';
  bodyFont: 'serif' | 'sans' | 'mono';
  size: 'small' | 'medium' | 'large';
}

export interface SectionOrder {
  order: ('summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications')[];
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;

  layout: LayoutType;
  components: ComponentConfig;
  sections: SectionOrder;

  colorScheme: ColorScheme;
  fontConfig: FontConfig;

  // Metadata
  category: string;
  atsCompatibility: number;
  photoSupport: boolean;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive' | 'all';
}
