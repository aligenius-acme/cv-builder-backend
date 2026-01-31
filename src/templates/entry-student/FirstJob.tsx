/**
 * First Job Template
 * Simple, effective template for first job seekers
 *
 * Features:
 * - Simple, straightforward layout
 * - Emerald color scheme
 * - Focus on potential and transferable skills
 * - No experience required
 * - One-page optimized
 *
 * Target: First-time job seekers, no previous experience
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

// Template colors - Emerald
const TEMPLATE_COLORS: ColorPalette = {
  primary: '#059669',        // Emerald
  secondary: '#047857',      // Dark emerald
  accent: '#a7f3d0',         // Light emerald
  text: '#0f172a',           // Almost black
  textLight: '#334155',      // Dark gray
  textMuted: '#64748b',      // Medium gray
  background: '#ffffff',     // White
  backgroundAlt: '#ecfdf5',  // Very light emerald
  border: '#6ee7b7',         // Light emerald
  borderLight: '#a7f3d0',    // Very light emerald
  success: '#10b981',        // Green
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
};

/**
 * PDF Component
 */
const FirstJobPDF: React.FC<TemplatePDFProps> = ({ data, colors = TEMPLATE_COLORS, options }) => {
  const { contact, summary, education, experience, projects, skills, certifications } = data;

  return (
    <div
      style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: 11,
        color: colors.text,
        padding: '0.5in 0.7in',
        maxWidth: '8.5in',
        minHeight: '11in',
      }}
    >
      {/* Header */}
      <Header contact={contact} colors={colors} variant="centered" showLinks={true} />

      {/* Objective */}
      {summary && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Objective" colors={colors} variant="minimal" uppercase={true} />
          <p style={{ margin: '0', lineHeight: 1.5, color: colors.textLight }}>{summary}</p>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Education" colors={colors} variant="minimal" uppercase={true} />
          <EducationSection education={education} colors={colors} showGPA={true} layout="default" />
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Skills" colors={colors} variant="minimal" uppercase={true} />
          <SkillsSection skills={skills} colors={colors} layout="columns" columns={2} />
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Projects" colors={colors} variant="minimal" uppercase={true} />
          <ProjectsSection projects={projects} colors={colors} showTechnologies={true} layout="default" />
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Experience" colors={colors} variant="minimal" uppercase={true} />
          <ExperienceSection experiences={experience} colors={colors} layout="compact" />
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Certifications" colors={colors} variant="minimal" uppercase={true} />
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
export const FirstJobTemplate: ReactTemplate = {
  id: 'first-job',
  name: 'First Job',
  metadata: createTemplateMetadata({
    id: 'first-job',
    name: 'First Job',
    category: 'entry-level',
    description: 'Simple, effective template for first-time job seekers with no prior experience',
    colorPalettes: ['emerald', 'green', 'teal', 'blue'],
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
    bestFor: ['First Job', 'No Experience', 'Entry-Level', 'Students'],
    version: '1.0.0',
  }),
  PDFComponent: FirstJobPDF,
  generateDOCX,
};

export default FirstJobTemplate;
