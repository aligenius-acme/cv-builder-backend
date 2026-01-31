/**
 * Career Change Template
 * Template optimized for career changers entering new field
 *
 * Features:
 * - Transferable skills emphasized
 * - Amber color scheme
 * - Flexible experience presentation
 * - Skills-based layout
 * - One-page optimized
 *
 * Target: Career changers, industry switchers, reskilling
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

// Template colors - Warm amber
const TEMPLATE_COLORS: ColorPalette = {
  primary: '#d97706',        // Amber
  secondary: '#b45309',      // Dark amber
  accent: '#fde68a',         // Light amber
  text: '#0f172a',           // Almost black
  textLight: '#334155',      // Dark gray
  textMuted: '#64748b',      // Medium gray
  background: '#ffffff',     // White
  backgroundAlt: '#fffbeb',  // Very light amber
  border: '#fcd34d',         // Light amber
  borderLight: '#fde68a',    // Very light amber
  success: '#10b981',        // Green
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
};

/**
 * PDF Component
 */
const CareerChangePDF: React.FC<TemplatePDFProps> = ({ data, colors = TEMPLATE_COLORS, options }) => {
  const { contact, summary, education, experience, projects, skills, certifications } = data;

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 11,
        color: colors.text,
        padding: '0.5in 0.65in',
        maxWidth: '8.5in',
        minHeight: '11in',
      }}
    >
      {/* Header */}
      <Header contact={contact} colors={colors} variant="left" showLinks={true} />

      {/* Career Transition Statement */}
      {summary && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Professional Profile" colors={colors} variant="sidebar" />
          <p style={{ margin: '0', lineHeight: 1.5, color: colors.textLight }}>{summary}</p>
        </div>
      )}

      {/* Skills - Prominent for career changers */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Core Competencies" colors={colors} variant="sidebar" />
          <SkillsSection skills={skills} colors={colors} layout="pills" />
        </div>
      )}

      {/* Education/Training */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Education & Training" colors={colors} variant="sidebar" />
          <EducationSection education={education} colors={colors} showGPA={false} layout="default" />
        </div>
      )}

      {/* Certifications - Important for career change */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Certifications & Credentials" colors={colors} variant="sidebar" />
          <CertificationsSection certifications={certifications} colors={colors} layout="default" />
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Relevant Projects" colors={colors} variant="sidebar" />
          <ProjectsSection projects={projects} colors={colors} showTechnologies={true} layout="default" />
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Professional Experience" colors={colors} variant="sidebar" />
          <ExperienceSection experiences={experience} colors={colors} layout="default" />
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
export const CareerChangeTemplate: ReactTemplate = {
  id: 'career-change',
  name: 'Career Change',
  metadata: createTemplateMetadata({
    id: 'career-change',
    name: 'Career Change',
    category: 'entry-level',
    description: 'Skills-focused template for career changers emphasizing transferable skills',
    colorPalettes: ['amber', 'orange', 'yellow', 'gold'],
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
    bestFor: ['Career Change', 'Industry Switch', 'Reskilling', 'Transition Roles'],
    version: '1.0.0',
  }),
  PDFComponent: CareerChangePDF,
  generateDOCX,
};

export default CareerChangeTemplate;
