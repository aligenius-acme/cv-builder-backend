/**
 * Career Launch Template
 * Dynamic template for launching your career
 *
 * Features:
 * - Dynamic, energetic design
 * - Lime green color scheme
 * - Achievement-focused
 * - Modern layout
 * - One-page optimized
 *
 * Target: Career launch, ambitious entry-level candidates
 */

import React from 'react';
import { Document } from 'docx';
import { ParsedResumeData } from '../../types';
import { ColorPalette } from '../shared/styles/colors';
import { ReactTemplate, TemplatePDFProps, createTemplateMetadata } from '../index';
import { Header } from '../shared/components/Header';
import { SectionHeader } from '../shared/components/SectionHeader';
import { EducationSection } from '../shared/components/EducationSection';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { ProjectsSection } from '../shared/components/ProjectsSection';
import { SkillsSection } from '../shared/components/SkillsSection';
import { CertificationsSection } from '../shared/components/CertificationsSection';

// Template colors - Energetic lime
const TEMPLATE_COLORS: ColorPalette = {
  primary: '#84cc16',        // Lime
  secondary: '#65a30d',      // Dark lime
  accent: '#d9f99d',         // Light lime
  text: '#0f172a',           // Almost black
  textLight: '#334155',      // Dark gray
  textMuted: '#64748b',      // Medium gray
  background: '#ffffff',     // White
  backgroundAlt: '#f7fee7',  // Very light lime
  border: '#bef264',         // Light lime
  borderLight: '#d9f99d',    // Very light lime
  success: '#10b981',        // Green
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
};

/**
 * PDF Component
 */
const CareerLaunchPDF: React.FC<TemplatePDFProps> = ({ data, colors = TEMPLATE_COLORS, options }) => {
  const { contact, summary, education, experience, projects, skills, certifications } = data;

  return (
    <div
      style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: 11,
        color: colors.text,
        padding: '0.5in 0.6in',
        maxWidth: '8.5in',
        minHeight: '11in',
      }}
    >
      {/* Header */}
      <Header contact={contact} colors={colors} variant="left" showLinks={true} />

      {/* Career Launch Statement */}
      {summary && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Career Focus" colors={colors} variant="underline" />
          <p style={{ margin: '0', lineHeight: 1.5, color: colors.textLight, fontWeight: 500 }}>{summary}</p>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Key Skills" colors={colors} variant="underline" />
          <SkillsSection skills={skills} colors={colors} layout="grid" columns={3} />
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Education" colors={colors} variant="underline" />
          <EducationSection education={education} colors={colors} showGPA={true} layout="default" />
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Key Projects" colors={colors} variant="underline" />
          <ProjectsSection projects={projects} colors={colors} showTechnologies={true} layout="detailed" />
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Professional Experience" colors={colors} variant="underline" />
          <ExperienceSection experiences={experience} colors={colors} layout="default" />
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Certifications & Achievements" colors={colors} variant="underline" />
          <CertificationsSection certifications={certifications} colors={colors} layout="compact" />
        </div>
      )}
    </div>
  );
};

/**
 * DOCX Generator
 */
function generateDOCX(
  data: ParsedResumeData,
  colors: ColorPalette,
  options?: any
): Document {
  const { generateDOCX: generateDOCXImpl } = require('./generateDOCX');
  return generateDOCXImpl(data, colors, options);
}

/**
 * Template Export
 */
export const CareerLaunchTemplate: ReactTemplate = {
  id: 'career-launch',
  name: 'Career Launch',
  metadata: createTemplateMetadata({
    id: 'career-launch',
    name: 'Career Launch',
    category: 'entry-level',
    description: 'Dynamic template for launching your career with energetic design',
    colorPalettes: ['lime', 'green', 'emerald', 'teal'],
    features: {
      twoColumn: false,
      headerImage: false,
      colorCustomization: true,
      sectionIcons: false,
      skillBars: false,
      timeline: false,
      portfolio: true,
      publications: false,
      languages: false,
      certifications: true,
    },
    atsScore: 95,
    bestFor: ['Career Launch', 'Entry-Level', 'Ambitious Graduates', 'First Professional Role'],
    version: '1.0.0',
  }),
  PDFComponent: CareerLaunchPDF,
  generateDOCX,
};

export default CareerLaunchTemplate;
