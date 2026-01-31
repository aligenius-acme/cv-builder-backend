/**
 * Social Media Pro Template
 *
 * Social media professional design with banner header
 * Single-column body with platform-focused sections
 * Perfect for social media managers and strategists
 *
 * ATS Score: 67/100 (visual-first)
 */

import React from 'react';
import { TemplatePDFProps, createTemplateMetadata } from '../index';
import { SectionHeader } from '../shared/components/SectionHeader';
import { SkillsSection } from '../shared/components/SkillsSection';
import { ExperienceSection } from '../shared/components/ExperienceSection';
import { EducationSection } from '../shared/components/EducationSection';
import { ProjectsSection } from '../shared/components/ProjectsSection';
import { CertificationsSection } from '../shared/components/CertificationsSection';
import { getColorPalette } from '../shared/styles/colors';

export const SocialMediaProPDF: React.FC<TemplatePDFProps> = ({ data, colors, options }) => {
  const palette = colors || getColorPalette('vibrant');

  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', backgroundColor: palette.background, color: palette.text, minHeight: '100vh' }}>
      {/* Banner Header with social media flair */}
      <div style={{ backgroundColor: palette.primary, padding: '36px 48px', color: '#FFFFFF', marginBottom: 30, borderBottom: `4px solid ${palette.primaryDark || palette.primary}` }}>
        <h1 style={{ fontSize: '27pt', fontWeight: 900, color: '#FFFFFF', margin: '0 0 10px 0', lineHeight: 1.05, textTransform: 'uppercase' }}>
          {data.contact.name || 'Your Name'}
        </h1>
        <div style={{ fontSize: '12.5pt', fontWeight: 700, color: 'rgba(255, 255, 255, 0.95)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '2px' }}>
          Social Media Professional
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: '9.5pt', color: 'rgba(255, 255, 255, 0.95)', flexWrap: 'wrap' }}>
          {data.contact.email && <div>{data.contact.email}</div>}
          {data.contact.phone && <div>{data.contact.phone}</div>}
          {data.contact.website && <div style={{ fontWeight: 700 }}>{data.contact.website}</div>}
        </div>
      </div>

      <div style={{ padding: '0 48px 48px 48px', maxWidth: '780px', margin: '0 auto' }}>
        {data.summary && (
          <div style={{ marginBottom: 28, padding: '18px', backgroundColor: palette.backgroundAlt, borderLeft: `4px solid ${palette.primary}` }}>
            <div style={{ fontSize: '10.5pt', fontWeight: 800, color: palette.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>Profile</div>
            <p style={{ margin: '0', lineHeight: 1.7, fontSize: '10.5pt' }}>{data.summary}</p>
          </div>
        )}

        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Platforms & Skills" colors={palette} variant="filled" uppercase={true} />
            <SkillsSection skills={data.skills} colors={palette} layout="pills" />
          </div>
        )}

        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Experience" colors={palette} variant="filled" uppercase={true} />
            <ExperienceSection experiences={data.experience} colors={palette} showDuration={true} layout="default" />
          </div>
        )}

        {data.projects && data.projects.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Campaign Highlights" colors={palette} variant="filled" uppercase={true} />
            <ProjectsSection projects={data.projects} colors={palette} showTechnologies={true} showLinks={true} layout="default" />
          </div>
        )}

        <div style={{ display: 'flex', gap: 28, marginBottom: 28 }}>
          {data.education && data.education.length > 0 && (
            <div style={{ flex: 1 }}>
              <SectionHeader title="Education" colors={palette} variant="filled" uppercase={true} />
              <EducationSection education={data.education} colors={palette} layout="compact" />
            </div>
          )}
          {data.certifications && data.certifications.length > 0 && (
            <div style={{ flex: 1 }}>
              <SectionHeader title="Certifications" colors={palette} variant="filled" uppercase={true} />
              <CertificationsSection certifications={data.certifications} colors={palette} layout="list" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SocialMediaProMetadata = createTemplateMetadata({
  id: 'social-media-pro',
  name: 'Social Media Pro',
  category: 'creative',
  description: 'Dynamic template for social media professionals with campaign highlights',
  colorPalettes: ['vibrant', 'modern', 'creative'],
  atsScore: 67,
  bestFor: ['Social Media Managers', 'Social Media Strategists', 'Community Managers', 'Social Media Coordinators', 'Digital Marketing Specialists'],
  features: { twoColumn: false, headerImage: false, colorCustomization: true, sectionIcons: false, skillBars: false, timeline: false, portfolio: true, publications: false, languages: false, certifications: true },
});

export default SocialMediaProPDF;
