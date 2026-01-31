/**
 * Career Starter Template
 * Versatile template for beginning your career journey
 *
 * Features:
 * - Balanced layout
 * - Mint green color scheme
 * - Flexible section ordering
 * - Modern, approachable design
 * - One-page optimized
 *
 * Target: Career starters, first job, entry positions
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

// Template colors - Fresh mint
const TEMPLATE_COLORS: ColorPalette = {
  primary: '#10b981',        // Mint green
  secondary: '#059669',      // Dark mint
  accent: '#a7f3d0',         // Light mint
  text: '#0f172a',           // Almost black
  textLight: '#334155',      // Dark gray
  textMuted: '#64748b',      // Medium gray
  background: '#ffffff',     // White
  backgroundAlt: '#ecfdf5',  // Very light mint
  border: '#6ee7b7',         // Light mint
  borderLight: '#a7f3d0',    // Very light mint
  success: '#10b981',        // Green
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
};

/**
 * PDF Component
 */
const CareerStarterPDF: React.FC<TemplatePDFProps> = ({ data, colors = TEMPLATE_COLORS, options }) => {
  const { contact, summary, education, experience, projects, skills, certifications } = data;

  return (
    <div
      style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: 11,
        color: colors.text,
        padding: '0.55in 0.65in',
        maxWidth: '8.5in',
        minHeight: '11in',
      }}
    >
      {/* Header */}
      <Header contact={contact} colors={colors} variant="centered" showLinks={true} />

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Summary" colors={colors} variant="default" />
          <p style={{ margin: '0', lineHeight: 1.5, color: colors.textLight }}>{summary}</p>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Education" colors={colors} variant="default" />
          <EducationSection education={education} colors={colors} showGPA={true} layout="default" />
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Core Skills" colors={colors} variant="default" />
          <SkillsSection skills={skills} colors={colors} layout="pills" />
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Experience" colors={colors} variant="default" />
          <ExperienceSection experiences={experience} colors={colors} layout="default" />
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Projects" colors={colors} variant="default" />
          <ProjectsSection projects={projects} colors={colors} showTechnologies={true} layout="default" />
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Certifications" colors={colors} variant="default" />
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
export const CareerStarterTemplate: ReactTemplate = {
  id: 'career-starter',
  name: 'Career Starter',
  metadata: createTemplateMetadata({
    id: 'career-starter',
    name: 'Career Starter',
    category: 'entry-level',
    description: 'Versatile template for beginning your career with balanced layout',
    colorPalettes: ['mint', 'green', 'teal', 'blue'],
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
    bestFor: ['Entry-Level', 'First Job', 'Career Change', 'Recent Grads'],
    version: '1.0.0',
  }),
  PDFComponent: CareerStarterPDF,
  generateDOCX,
};

export default CareerStarterTemplate;
