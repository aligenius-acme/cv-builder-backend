/**
 * Freshman Template
 * Simple template for first and second year students
 *
 * Features:
 * - Very simple, clean layout
 * - Violet color scheme
 * - Education and potential focused
 * - Activities and coursework emphasized
 * - One-page optimized
 *
 * Target: First and second year students, minimal experience
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

// Template colors - Fresh violet
const TEMPLATE_COLORS: ColorPalette = {
  primary: '#8b5cf6',        // Violet
  secondary: '#7c3aed',      // Dark violet
  accent: '#ddd6fe',         // Light violet
  text: '#0f172a',           // Almost black
  textLight: '#334155',      // Dark gray
  textMuted: '#64748b',      // Medium gray
  background: '#ffffff',     // White
  backgroundAlt: '#f5f3ff',  // Very light violet
  border: '#c4b5fd',         // Light violet
  borderLight: '#ddd6fe',    // Very light violet
  success: '#10b981',        // Green
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
};

/**
 * PDF Component
 */
const FreshmanPDF: React.FC<TemplatePDFProps> = ({ data, colors = TEMPLATE_COLORS, options }) => {
  const { contact, summary, education, experience, projects, skills, certifications } = data;

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
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
          <EducationSection education={education} colors={colors} showGPA={true} layout="detailed" />
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Skills" colors={colors} variant="minimal" uppercase={true} />
          <SkillsSection skills={skills} colors={colors} layout="inline" />
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Projects & Coursework" colors={colors} variant="minimal" uppercase={true} />
          <ProjectsSection projects={projects} colors={colors} showTechnologies={true} layout="default" />
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Experience & Activities" colors={colors} variant="minimal" uppercase={true} />
          <ExperienceSection experiences={experience} colors={colors} layout="compact" />
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Honors & Awards" colors={colors} variant="minimal" uppercase={true} />
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
export const FreshmanTemplate: ReactTemplate = {
  id: 'freshman',
  name: 'Freshman',
  metadata: createTemplateMetadata({
    id: 'freshman',
    name: 'Freshman',
    category: 'entry-level',
    description: 'Simple template for first and second year students with minimal experience',
    colorPalettes: ['violet', 'purple', 'indigo', 'blue'],
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
    bestFor: ['First Year Students', 'Sophomores', 'Minimal Experience', 'Student Jobs'],
    version: '1.0.0',
  }),
  PDFComponent: FreshmanPDF,
  generateDOCX,
};

export default FreshmanTemplate;
