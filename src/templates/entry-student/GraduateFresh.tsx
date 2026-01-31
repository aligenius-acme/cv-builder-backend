/**
 * Graduate Fresh Template
 * Clean, modern template optimized for recent graduates
 *
 * Features:
 * - Education-first layout
 * - Teal color scheme
 * - Clean, modern design
 * - Projects section prominent
 * - One-page optimized
 *
 * Target: Recent graduates, first professional role
 */

import React from 'react';
import { Document } from 'docx';
import { ParsedResumeData } from '../../types';
import { ColorPalette, createCustomPalette } from '../shared/styles/colors';
import { ReactTemplate, TemplatePDFProps, createTemplateMetadata } from '../index';
import { Header } from '../shared/components/Header';
import { SectionHeader } from '../shared/components/SectionHeader';
import { EducationSection } from '../shared/components/EducationSection';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { ProjectsSection } from '../shared/components/ProjectsSection';
import { SkillsSection } from '../shared/components/SkillsSection';
import { CertificationsSection } from '../shared/components/CertificationsSection';

// Template colors - Fresh teal
const TEMPLATE_COLORS: ColorPalette = {
  primary: '#14b8a6',        // Teal
  secondary: '#0d9488',      // Dark teal
  accent: '#5eead4',         // Light teal
  text: '#0f172a',           // Almost black
  textLight: '#334155',      // Dark gray
  textMuted: '#64748b',      // Medium gray
  background: '#ffffff',     // White
  backgroundAlt: '#f0fdfa',  // Very light teal
  border: '#99f6e4',         // Light teal
  borderLight: '#ccfbf1',    // Very light teal
  success: '#10b981',        // Green
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
};

/**
 * PDF Component
 */
const GraduateFreshPDF: React.FC<TemplatePDFProps> = ({ data, colors = TEMPLATE_COLORS, options }) => {
  const { contact, summary, education, experience, projects, skills, certifications } = data;

  return (
    <div
      style={{
        fontFamily: 'Calibri, Arial, sans-serif',
        fontSize: 11,
        color: colors.text,
        padding: '0.5in 0.6in',
        maxWidth: '8.5in',
        minHeight: '11in',
      }}
    >
      {/* Header */}
      <Header contact={contact} colors={colors} variant="centered" showLinks={true} />

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Profile" colors={colors} variant="underline" />
          <p style={{ margin: '0', lineHeight: 1.5, color: colors.textLight }}>{summary}</p>
        </div>
      )}

      {/* Education - First for entry-level */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Education" colors={colors} variant="underline" />
          <EducationSection education={education} colors={colors} showGPA={true} layout="detailed" />
        </div>
      )}

      {/* Projects - Prominent for students */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Projects" colors={colors} variant="underline" />
          <ProjectsSection projects={projects} colors={colors} showTechnologies={true} layout="detailed" />
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
 * DOCX Generator - Will be imported from generateDOCX.ts
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
export const GraduateFreshTemplate: ReactTemplate = {
  id: 'graduate-fresh',
  name: 'Graduate Fresh',
  metadata: createTemplateMetadata({
    id: 'graduate-fresh',
    name: 'Graduate Fresh',
    category: 'entry-level',
    description: 'Clean, modern template optimized for recent graduates with education-first layout',
    colorPalettes: ['teal', 'blue', 'green', 'purple'],
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
    bestFor: ['Recent Graduates', 'Entry-Level', 'First Job', 'Students'],
    version: '1.0.0',
  }),
  PDFComponent: GraduateFreshPDF,
  generateDOCX,
};

export default GraduateFreshTemplate;
