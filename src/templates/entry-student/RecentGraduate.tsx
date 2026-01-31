/**
 * Recent Graduate Template
 * Academic-focused template for new graduates
 *
 * Features:
 * - Academic credentials highlighted
 * - Purple color scheme
 * - GPA and honors prominent
 * - Research and projects emphasized
 * - One-page optimized
 *
 * Target: Recent graduates, graduate school applicants
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

// Template colors - Academic purple
const TEMPLATE_COLORS: ColorPalette = {
  primary: '#7c3aed',        // Purple
  secondary: '#6d28d9',      // Dark purple
  accent: '#c4b5fd',         // Light purple
  text: '#0f172a',           // Almost black
  textLight: '#334155',      // Dark gray
  textMuted: '#64748b',      // Medium gray
  background: '#ffffff',     // White
  backgroundAlt: '#f5f3ff',  // Very light purple
  border: '#c4b5fd',         // Light purple
  borderLight: '#ddd6fe',    // Very light purple
  success: '#10b981',        // Green
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
};

/**
 * PDF Component
 */
const RecentGraduatePDF: React.FC<TemplatePDFProps> = ({ data, colors = TEMPLATE_COLORS, options }) => {
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
          <p style={{ margin: '0', lineHeight: 1.5, color: colors.textLight, textAlign: 'center' }}>{summary}</p>
        </div>
      )}

      {/* Education - Prominent for recent grads */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Education" colors={colors} variant="underline" />
          <EducationSection education={education} colors={colors} showGPA={true} layout="detailed" />
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Technical Skills" colors={colors} variant="underline" />
          <SkillsSection skills={skills} colors={colors} layout="columns" columns={3} />
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Academic & Personal Projects" colors={colors} variant="underline" />
          <ProjectsSection projects={projects} colors={colors} showTechnologies={true} layout="detailed" />
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Relevant Experience" colors={colors} variant="underline" />
          <ExperienceSection experiences={experience} colors={colors} layout="default" />
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Certifications & Honors" colors={colors} variant="underline" />
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
export const RecentGraduateTemplate: ReactTemplate = {
  id: 'recent-graduate',
  name: 'Recent Graduate',
  metadata: createTemplateMetadata({
    id: 'recent-graduate',
    name: 'Recent Graduate',
    category: 'entry-level',
    description: 'Academic-focused template highlighting education and achievements for new graduates',
    colorPalettes: ['purple', 'indigo', 'blue', 'teal'],
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
    bestFor: ['Recent Graduates', 'Graduate School', 'Entry-Level', 'First Career Role'],
    version: '1.0.0',
  }),
  PDFComponent: RecentGraduatePDF,
  generateDOCX,
};

export default RecentGraduateTemplate;
