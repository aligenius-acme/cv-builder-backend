/**
 * Intern Ready Template
 * Professional template optimized for internship applications
 *
 * Features:
 * - Professional yet fresh design
 * - Coral accent color
 * - Skills and coursework prominent
 * - Extracurricular activities section
 * - One-page optimized
 *
 * Target: Internship seekers, summer positions, work-study
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

// Template colors - Energetic coral
const TEMPLATE_COLORS: ColorPalette = {
  primary: '#f97316',        // Coral/Orange
  secondary: '#ea580c',      // Dark coral
  accent: '#fed7aa',         // Light coral
  text: '#0f172a',           // Almost black
  textLight: '#334155',      // Dark gray
  textMuted: '#64748b',      // Medium gray
  background: '#ffffff',     // White
  backgroundAlt: '#fff7ed',  // Very light orange
  border: '#fdba74',         // Light orange
  borderLight: '#fed7aa',    // Very light orange
  success: '#10b981',        // Green
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
};

/**
 * PDF Component
 */
const InternReadyPDF: React.FC<TemplatePDFProps> = ({ data, colors = TEMPLATE_COLORS, options }) => {
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

      {/* Objective */}
      {summary && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Career Objective" colors={colors} variant="sidebar" />
          <p style={{ margin: '0', lineHeight: 1.5, color: colors.textLight }}>{summary}</p>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Education" colors={colors} variant="sidebar" />
          <EducationSection education={education} colors={colors} showGPA={true} layout="detailed" />
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Skills & Competencies" colors={colors} variant="sidebar" />
          <SkillsSection skills={skills} colors={colors} layout="columns" columns={2} />
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Projects" colors={colors} variant="sidebar" />
          <ProjectsSection projects={projects} colors={colors} showTechnologies={true} layout="default" />
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Relevant Experience" colors={colors} variant="sidebar" />
          <ExperienceSection experiences={experience} colors={colors} layout="default" />
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionHeader title="Certifications & Awards" colors={colors} variant="sidebar" />
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
export const InternReadyTemplate: ReactTemplate = {
  id: 'intern-ready',
  name: 'Intern Ready',
  metadata: createTemplateMetadata({
    id: 'intern-ready',
    name: 'Intern Ready',
    category: 'entry-level',
    description: 'Professional template optimized for internship applications with skills focus',
    colorPalettes: ['coral', 'orange', 'blue', 'green'],
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
    bestFor: ['Internships', 'Summer Jobs', 'Work-Study', 'Entry-Level'],
    version: '1.0.0',
  }),
  PDFComponent: InternReadyPDF,
  generateDOCX,
};

export default InternReadyTemplate;
