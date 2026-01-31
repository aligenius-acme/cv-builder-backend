/**
 * Entry Level Template
 * Classic template for entry-level positions
 *
 * Features:
 * - Traditional professional layout
 * - Blue color scheme
 * - Standard sections
 * - ATS-optimized
 * - One-page optimized
 *
 * Target: Entry-level positions across industries
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

// Template colors - Professional blue
const TEMPLATE_COLORS: ColorPalette = {
  primary: '#2563eb',        // Blue
  secondary: '#1d4ed8',      // Dark blue
  accent: '#93c5fd',         // Light blue
  text: '#0f172a',           // Almost black
  textLight: '#334155',      // Dark gray
  textMuted: '#64748b',      // Medium gray
  background: '#ffffff',     // White
  backgroundAlt: '#eff6ff',  // Very light blue
  border: '#93c5fd',         // Light blue
  borderLight: '#bfdbfe',    // Very light blue
  success: '#10b981',        // Green
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
};

/**
 * PDF Component
 */
const EntryLevelPDF: React.FC<TemplatePDFProps> = ({ data, colors = TEMPLATE_COLORS, options }) => {
  const { contact, summary, education, experience, projects, skills, certifications } = data;

  return (
    <div
      style={{
        fontFamily: 'Calibri, Arial, sans-serif',
        fontSize: 11,
        color: colors.text,
        padding: '0.6in 0.7in',
        maxWidth: '8.5in',
        minHeight: '11in',
      }}
    >
      {/* Header */}
      <Header contact={contact} colors={colors} variant="left" showLinks={true} />

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Professional Summary" colors={colors} variant="underline" />
          <p style={{ margin: '0', lineHeight: 1.5, color: colors.textLight }}>{summary}</p>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Education" colors={colors} variant="underline" />
          <EducationSection education={education} colors={colors} showGPA={true} layout="default" />
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Skills" colors={colors} variant="underline" />
          <SkillsSection skills={skills} colors={colors} layout="grid" columns={3} />
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Experience" colors={colors} variant="underline" />
          <ExperienceSection experiences={experience} colors={colors} layout="default" />
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Projects" colors={colors} variant="underline" />
          <ProjectsSection projects={projects} colors={colors} showTechnologies={true} layout="compact" />
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Certifications" colors={colors} variant="underline" />
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
export const EntryLevelTemplate: ReactTemplate = {
  id: 'entry-level',
  name: 'Entry Level',
  metadata: createTemplateMetadata({
    id: 'entry-level',
    name: 'Entry Level',
    category: 'entry-level',
    description: 'Classic professional template optimized for entry-level positions',
    colorPalettes: ['blue', 'navy', 'slate', 'professional'],
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
    atsScore: 98,
    bestFor: ['Entry-Level', 'All Industries', 'First Career Job', 'Graduates'],
    version: '1.0.0',
  }),
  PDFComponent: EntryLevelPDF,
  generateDOCX,
};

export default EntryLevelTemplate;
