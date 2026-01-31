/**
 * College Student Template
 * Comprehensive template for current college students
 *
 * Features:
 * - Education and activities balanced
 * - Sky blue color scheme
 * - Leadership and involvement sections
 * - Coursework highlighted
 * - One-page optimized
 *
 * Target: College students, campus recruiting, student organizations
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

// Template colors - Sky blue
const TEMPLATE_COLORS: ColorPalette = {
  primary: '#0ea5e9',        // Sky blue
  secondary: '#0284c7',      // Dark sky
  accent: '#bae6fd',         // Light sky
  text: '#0f172a',           // Almost black
  textLight: '#334155',      // Dark gray
  textMuted: '#64748b',      // Medium gray
  background: '#ffffff',     // White
  backgroundAlt: '#f0f9ff',  // Very light sky
  border: '#7dd3fc',         // Light sky
  borderLight: '#bae6fd',    // Very light sky
  success: '#10b981',        // Green
  warning: '#f59e0b',        // Amber
  error: '#ef4444',          // Red
};

/**
 * PDF Component
 */
const CollegeStudentPDF: React.FC<TemplatePDFProps> = ({ data, colors = TEMPLATE_COLORS, options }) => {
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
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Career Objective" colors={colors} variant="default" />
          <p style={{ margin: '0', lineHeight: 1.5, color: colors.textLight }}>{summary}</p>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Education" colors={colors} variant="default" />
          <EducationSection education={education} colors={colors} showGPA={true} layout="detailed" />
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Skills" colors={colors} variant="default" />
          <SkillsSection skills={skills} colors={colors} layout="grid" columns={3} />
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Experience & Leadership" colors={colors} variant="default" />
          <ExperienceSection experiences={experience} colors={colors} layout="default" />
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Projects & Activities" colors={colors} variant="default" />
          <ProjectsSection projects={projects} colors={colors} showTechnologies={true} layout="default" />
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <SectionHeader title="Awards & Certifications" colors={colors} variant="default" />
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
export const CollegeStudentTemplate: ReactTemplate = {
  id: 'college-student',
  name: 'College Student',
  metadata: createTemplateMetadata({
    id: 'college-student',
    name: 'College Student',
    category: 'entry-level',
    description: 'Comprehensive template for college students with focus on education and activities',
    colorPalettes: ['sky', 'blue', 'cyan', 'teal'],
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
    bestFor: ['College Students', 'Campus Recruiting', 'Internships', 'Student Jobs'],
    version: '1.0.0',
  }),
  PDFComponent: CollegeStudentPDF,
  generateDOCX,
};

export default CollegeStudentTemplate;
