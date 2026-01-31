/**
 * Internship Template
 * Dedicated template for internship applications
 *
 * Features:
 * - Academic focus
 * - Cyan color scheme
 * - Coursework and projects emphasized
 * - Clean, professional design
 * - One-page optimized
 *
 * Target: Internship applications, co-op programs
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

// Template colors - Professional cyan
const TEMPLATE_COLORS: ColorPalette = {
  primary: '#06b6d4',        // Cyan
  secondary: '#0891b2',      // Dark cyan
  accent: '#a5f3fc',         // Light cyan
  text: '#0f172a',           // Almost black
  textLight: '#334155',      // Dark gray
  textMuted: '#64748b',      // Medium gray
  background: '#ffffff',     // White
  backgroundAlt: '#ecfeff',  // Very light cyan
  border: '#67e8f9',         // Light cyan
  borderLight: '#a5f3fc',    // Very light cyan
  success: '#10b981',        // Green
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
};

/**
 * PDF Component
 */
const InternshipPDF: React.FC<TemplatePDFProps> = ({ data, colors = TEMPLATE_COLORS, options }) => {
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

      {/* Objective */}
      {summary && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Internship Objective" colors={colors} variant="underline" />
          <p style={{ margin: '0', lineHeight: 1.5, color: colors.textLight }}>{summary}</p>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Education" colors={colors} variant="underline" />
          <EducationSection education={education} colors={colors} showGPA={true} layout="detailed" />
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Technical Skills" colors={colors} variant="underline" />
          <SkillsSection skills={skills} colors={colors} layout="grid" columns={3} />
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Projects" colors={colors} variant="underline" />
          <ProjectsSection projects={projects} colors={colors} showTechnologies={true} layout="detailed" />
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Experience" colors={colors} variant="underline" />
          <ExperienceSection experiences={experience} colors={colors} layout="default" />
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Certifications & Activities" colors={colors} variant="underline" />
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
export const InternshipTemplate: ReactTemplate = {
  id: 'internship',
  name: 'Internship',
  metadata: createTemplateMetadata({
    id: 'internship',
    name: 'Internship',
    category: 'entry-level',
    description: 'Dedicated template for internship applications with academic focus',
    colorPalettes: ['cyan', 'teal', 'blue', 'sky'],
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
    bestFor: ['Internships', 'Co-op Programs', 'Summer Positions', 'Student Jobs'],
    version: '1.0.0',
  }),
  PDFComponent: InternshipPDF,
  generateDOCX,
};

export default InternshipTemplate;
