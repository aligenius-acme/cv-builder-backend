/**
 * Student Clean Template
 * Minimalist template for current students
 *
 * Features:
 * - Ultra-clean design
 * - Indigo color scheme
 * - Education and coursework focused
 * - Academic projects highlighted
 * - One-page optimized
 *
 * Target: Current students, internships, co-op positions
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

// Template colors - Clean indigo
const TEMPLATE_COLORS: ColorPalette = {
  primary: '#4f46e5',        // Indigo
  secondary: '#4338ca',      // Dark indigo
  accent: '#a5b4fc',         // Light indigo
  text: '#0f172a',           // Almost black
  textLight: '#334155',      // Dark gray
  textMuted: '#64748b',      // Medium gray
  background: '#ffffff',     // White
  backgroundAlt: '#eef2ff',  // Very light indigo
  border: '#c7d2fe',         // Light indigo
  borderLight: '#e0e7ff',    // Very light indigo
  success: '#10b981',        // Green
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
};

/**
 * PDF Component
 */
const StudentCleanPDF: React.FC<TemplatePDFProps> = ({ data, colors = TEMPLATE_COLORS, options }) => {
  const { contact, summary, education, experience, projects, skills, certifications } = data;

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 10.5,
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
        <div style={{ marginBottom: 14 }}>
          <SectionHeader title="Objective" colors={colors} variant="minimal" uppercase={true} />
          <p style={{ margin: '0', lineHeight: 1.5, color: colors.textLight }}>{summary}</p>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <SectionHeader title="Education" colors={colors} variant="minimal" uppercase={true} />
          <EducationSection education={education} colors={colors} showGPA={true} layout="detailed" />
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <SectionHeader title="Skills" colors={colors} variant="minimal" uppercase={true} />
          <SkillsSection skills={skills} colors={colors} layout="inline" />
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <SectionHeader title="Academic Projects" colors={colors} variant="minimal" uppercase={true} />
          <ProjectsSection projects={projects} colors={colors} showTechnologies={true} layout="default" />
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <SectionHeader title="Experience" colors={colors} variant="minimal" uppercase={true} />
          <ExperienceSection experiences={experience} colors={colors} layout="compact" />
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: 14 }}>
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
export const StudentCleanTemplate: ReactTemplate = {
  id: 'student-clean',
  name: 'Student Clean',
  metadata: createTemplateMetadata({
    id: 'student-clean',
    name: 'Student Clean',
    category: 'entry-level',
    description: 'Minimalist template for current students with focus on education and projects',
    colorPalettes: ['indigo', 'blue', 'slate', 'neutral'],
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
    bestFor: ['Students', 'Internships', 'Co-op', 'Part-time'],
    version: '1.0.0',
  }),
  PDFComponent: StudentCleanPDF,
  generateDOCX,
};

export default StudentCleanTemplate;
