/**
 * New Graduate Template
 * Fresh, modern template for brand new graduates
 *
 * Features:
 * - Modern, fresh design
 * - Rose color scheme
 * - Academic achievements highlighted
 * - Clean, vibrant layout
 * - One-page optimized
 *
 * Target: Brand new graduates, graduation season
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

// Template colors - Fresh rose
const TEMPLATE_COLORS: ColorPalette = {
  primary: '#e11d48',        // Rose
  secondary: '#be123c',      // Dark rose
  accent: '#fecdd3',         // Light rose
  text: '#0f172a',           // Almost black
  textLight: '#334155',      // Dark gray
  textMuted: '#64748b',      // Medium gray
  background: '#ffffff',     // White
  backgroundAlt: '#fff1f2',  // Very light rose
  border: '#fda4af',         // Light rose
  borderLight: '#fecdd3',    // Very light rose
  success: '#10b981',        // Green
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
};

/**
 * PDF Component
 */
const NewGraduatePDF: React.FC<TemplatePDFProps> = ({ data, colors = TEMPLATE_COLORS, options }) => {
  const { contact, summary, education, experience, projects, skills, certifications } = data;

  return (
    <div
      style={{
        fontFamily: 'Calibri, Arial, sans-serif',
        fontSize: 11,
        color: colors.text,
        padding: '0.5in 0.65in',
        maxWidth: '8.5in',
        minHeight: '11in',
      }}
    >
      {/* Header */}
      <Header contact={contact} colors={colors} variant="centered" showLinks={true} />

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Professional Profile" colors={colors} variant="sidebar" />
          <p style={{ margin: '0', lineHeight: 1.5, color: colors.textLight }}>{summary}</p>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Education" colors={colors} variant="sidebar" />
          <EducationSection education={education} colors={colors} showGPA={true} layout="detailed" />
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Skills" colors={colors} variant="sidebar" />
          <SkillsSection skills={skills} colors={colors} layout="pills" />
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Projects" colors={colors} variant="sidebar" />
          <ProjectsSection projects={projects} colors={colors} showTechnologies={true} layout="default" />
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Experience" colors={colors} variant="sidebar" />
          <ExperienceSection experiences={experience} colors={colors} layout="default" />
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Honors & Certifications" colors={colors} variant="sidebar" />
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
export const NewGraduateTemplate: ReactTemplate = {
  id: 'new-graduate',
  name: 'New Graduate',
  metadata: createTemplateMetadata({
    id: 'new-graduate',
    name: 'New Graduate',
    category: 'entry-level',
    description: 'Fresh, modern template for brand new graduates with vibrant design',
    colorPalettes: ['rose', 'pink', 'red', 'coral'],
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
    atsScore: 96,
    bestFor: ['New Graduates', 'Class of 2024/2025', 'First Job', 'Entry-Level'],
    version: '1.0.0',
  }),
  PDFComponent: NewGraduatePDF,
  generateDOCX,
};

export default NewGraduateTemplate;
