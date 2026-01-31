/**
 * Junior Professional Template
 * Template for professionals with 0-2 years experience
 *
 * Features:
 * - Professional styling
 * - Slate color scheme
 * - Experience and skills balanced
 * - Modern, clean design
 * - One-page optimized
 *
 * Target: Junior professionals, 0-2 years experience
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

// Template colors - Professional slate
const TEMPLATE_COLORS: ColorPalette = {
  primary: '#475569',        // Slate
  secondary: '#334155',      // Dark slate
  accent: '#cbd5e1',         // Light slate
  text: '#0f172a',           // Almost black
  textLight: '#334155',      // Dark gray
  textMuted: '#64748b',      // Medium gray
  background: '#ffffff',     // White
  backgroundAlt: '#f8fafc',  // Very light slate
  border: '#cbd5e1',         // Light slate
  borderLight: '#e2e8f0',    // Very light slate
  success: '#10b981',        // Green
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
};

/**
 * PDF Component
 */
const JuniorProfessionalPDF: React.FC<TemplatePDFProps> = ({ data, colors = TEMPLATE_COLORS, options }) => {
  const { contact, summary, education, experience, projects, skills, certifications } = data;

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
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
          <SectionHeader title="Professional Summary" colors={colors} variant="default" />
          <p style={{ margin: '0', lineHeight: 1.5, color: colors.textLight }}>{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Professional Experience" colors={colors} variant="default" />
          <ExperienceSection experiences={experience} colors={colors} layout="default" />
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Technical Skills" colors={colors} variant="default" />
          <SkillsSection skills={skills} colors={colors} layout="grid" columns={3} />
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Education" colors={colors} variant="default" />
          <EducationSection education={education} colors={colors} showGPA={true} layout="default" />
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Projects" colors={colors} variant="default" />
          <ProjectsSection projects={projects} colors={colors} showTechnologies={true} layout="compact" />
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
export const JuniorProfessionalTemplate: ReactTemplate = {
  id: 'junior-professional',
  name: 'Junior Professional',
  metadata: createTemplateMetadata({
    id: 'junior-professional',
    name: 'Junior Professional',
    category: 'entry-level',
    description: 'Professional template for junior-level positions with 0-2 years experience',
    colorPalettes: ['slate', 'gray', 'blue', 'neutral'],
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
    atsScore: 97,
    bestFor: ['Junior Professional', '0-2 Years Experience', 'Associate Roles', 'Entry-Level'],
    version: '1.0.0',
  }),
  PDFComponent: JuniorProfessionalPDF,
  generateDOCX,
};

export default JuniorProfessionalTemplate;
