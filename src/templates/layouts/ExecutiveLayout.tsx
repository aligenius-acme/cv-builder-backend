/**
 * ExecutiveLayout - Premium executive design
 *
 * Structure: Elegant serif typography, color accent top-band, full-width name header,
 *            two-column skills grid, formal spacing
 * Suitable for: Executive, leadership, finance, legal, board roles
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const ExecutiveLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, awards, projects, languages, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ marginBottom: '14px', marginTop: '26px' }}>
      <h2 style={{
        fontSize: `${fontSize.subheader + 1}px`,
        fontWeight: 700,
        color: primaryColor,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        textTransform: 'uppercase',
        letterSpacing: '2px',
        margin: 0,
        paddingBottom: '8px',
      }}>
        {children}
      </h2>
      <div style={{ display: 'flex', gap: '4px' }}>
        <div style={{ flex: 1, height: '2px', backgroundColor: primaryColor }} />
        <div style={{ flex: 3, height: '2px', backgroundColor: `${primaryColor}30` }} />
      </div>
    </div>
  );

  const contactItems = [
    contact.email && { label: 'Email', val: contact.email },
    contact.phone && { label: 'Phone', val: contact.phone },
    contact.location && { label: 'Location', val: contact.location },
    contact.linkedin && { label: 'LinkedIn', val: contact.linkedin },
    contact.website && { label: 'Web', val: contact.website },
  ].filter(Boolean) as { label: string; val: string }[];

  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      fontSize: `${fontSize.body}px`,
      color: textColor,
      backgroundColor,
      maxWidth: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      borderTop: `8px solid ${primaryColor}`,
    }}>

      {/* Header Area */}
      <div style={{
        padding: `28px ${margins.right}px 22px ${margins.left}px`,
        borderBottom: `1px solid ${primaryColor}30`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: `${fontSize.header + 8}px`,
              color: primaryColor,
              margin: 0,
              fontWeight: 700,
              letterSpacing: '0.5px',
              lineHeight: 1.15,
              fontFamily: "'Georgia', 'Times New Roman', serif",
            }}>
              {contact.name || 'Your Name'}
            </h1>
            {experience && experience[0]?.title && (
              <div style={{
                fontSize: `${fontSize.body + 1}px`,
                color: secondaryColor,
                fontWeight: 600,
                marginTop: '8px',
                fontFamily: 'Arial, sans-serif',
                letterSpacing: '0.5px',
              }}>
                {experience[0].title}
              </div>
            )}

            {/* Contact row */}
            {contactItems.length > 0 && (
              <div style={{
                marginTop: '14px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px 24px',
                fontFamily: 'Arial, sans-serif',
              }}>
                {contactItems.map((item, i) => (
                  <span key={i} style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>
                    {item.val}
                  </span>
                ))}
              </div>
            )}
          </div>
          {contact.photoUrl && (
            <div style={{ marginLeft: '30px', flexShrink: 0 }}>
              <PhotoCircle
                photoUrl={contact.photoUrl}
                name={contact.name || 'User'}
                size="large"
                position="right"
                primaryColor={primaryColor}
              />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: `0 ${margins.right}px ${margins.bottom}px ${margins.left}px` }}>

        {summary && (
          <>
            <SectionHeader>Executive Summary</SectionHeader>
            <p style={{
              fontSize: `${fontSize.body}px`,
              color: textColor,
              lineHeight: 1.85,
              margin: 0,
              textAlign: 'justify',
              fontFamily: "'Georgia', serif",
            }}>
              {summary}
            </p>
          </>
        )}

        {experience && experience.length > 0 && (
          <>
            <SectionHeader>Professional Experience</SectionHeader>
            {experience.map((exp, index) => (
              <div key={index} style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{
                    fontSize: `${fontSize.subheader + 1}px`,
                    color: textColor,
                    fontWeight: 700,
                    margin: 0,
                    fontFamily: "'Georgia', serif",
                  }}>
                    {exp.title}
                  </h3>
                  <span style={{
                    fontSize: `${fontSize.body - 1}px`,
                    color: mutedColor,
                    fontStyle: 'italic',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Arial, sans-serif',
                  }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div style={{
                  fontSize: `${fontSize.body}px`,
                  color: primaryColor,
                  fontWeight: 600,
                  marginTop: '4px',
                  marginBottom: '8px',
                  fontFamily: 'Arial, sans-serif',
                }}>
                  {exp.company}{exp.location && ` | ${exp.location}`}
                </div>
                <ul style={{ margin: 0, paddingLeft: '24px', listStyleType: 'square' }}>
                  {exp.description?.map((desc, i) => (
                    <li key={i} style={{
                      fontSize: `${fontSize.body}px`,
                      color: textColor,
                      lineHeight: 1.75,
                      marginBottom: '5px',
                      fontFamily: "'Georgia', serif",
                    }}>
                      {desc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}

        {education && education.length > 0 && (
          <>
            <SectionHeader>Education</SectionHeader>
            {education.map((edu, index) => (
              <div key={index} style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <h3 style={{ fontSize: `${fontSize.subheader}px`, color: textColor, fontWeight: 700, margin: 0, fontFamily: "'Georgia', serif" }}>
                    {edu.degree}
                  </h3>
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginTop: '3px', fontFamily: 'Arial, sans-serif' }}>
                    {edu.institution}{edu.location && ` | ${edu.location}`}{edu.gpa && ` | GPA: ${edu.gpa}`}
                  </div>
                </div>
                <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic', whiteSpace: 'nowrap', fontFamily: 'Arial, sans-serif' }}>
                  {edu.graduationDate}
                </span>
              </div>
            ))}
          </>
        )}

        {skills && skills.length > 0 && (
          <>
            <SectionHeader>Core Competencies</SectionHeader>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px 20px', fontFamily: 'Arial, sans-serif' }}>
              {(skills as any[]).map((skill, index) => {
                const skillText = typeof skill === 'string' ? skill : (skill as any).category || (skill as any).name || String(skill);
                return (
                  <div key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor, paddingLeft: '12px', borderLeft: `2px solid ${primaryColor}40` }}>
                    {skillText}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {certifications && certifications.length > 0 && (
          <>
            <SectionHeader>Professional Certifications</SectionHeader>
            {(certifications as any[]).map((cert, index) => (
              <div key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>
                ◆ {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? ` | ${cert.issuer}` : ''}${cert.date ? ` | ${cert.date}` : ''}`}
              </div>
            ))}
          </>
        )}

        {projects && projects.length > 0 && (
          <>
            <SectionHeader>Key Initiatives & Projects</SectionHeader>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, fontFamily: "'Georgia', serif" }}>{p.name}</div>
                {p.description && (Array.isArray(p.description) && p.description.length > 1 ? (
                  <ul style={{ margin: '4px 0', paddingLeft: '18px', listStyleType: 'disc' }}>
                    {p.description.map((d, di) => (
                      <li key={di} style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.7, marginBottom: '2px', marginTop: '3px' }}>{d}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.7, marginTop: '3px' }}>{Array.isArray(p.description) ? (p.description[0] || '') : p.description}</div>
                ))}
              </div>
            ))}
          </>
        )}

        {awards && awards.length > 0 && (
          <>
            <SectionHeader>Awards & Honours</SectionHeader>
            {(awards as any[]).map((award, index) => (
              <div key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>
                ◆ {typeof award === 'string' ? award : award.name}
                {typeof award === 'object' && award.date && <span style={{ color: mutedColor, marginLeft: '8px', fontStyle: 'italic' }}>({award.date})</span>}
              </div>
            ))}
          </>
        )}

        {languages && languages.length > 0 && (
          <>
            <SectionHeader>Languages</SectionHeader>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontFamily: 'Arial, sans-serif' }}>
              {languages.map((lang, index) => (
                <span key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor }}>◆ {lang}</span>
              ))}
            </div>
          </>
        )}

        {volunteerWork && volunteerWork.length > 0 && (
          <>
            <SectionHeader>Board & Civic Engagement</SectionHeader>
            {volunteerWork.map((v, i) => (
              <div key={i} style={{ marginBottom: '10px', fontFamily: 'Arial, sans-serif' }}>
                {typeof v === 'string' ? (
                  <div style={{ fontSize: `${fontSize.body}px`, color: textColor }}>◆ {v}</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontFamily: "'Georgia', serif" }}>{v.role}</span>
                      <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic' }}>
                        {v.startDate}{v.current ? ' – Present' : v.endDate ? ` – ${v.endDate}` : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600 }}>{v.organization}</div>
                  </>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Premium Bottom Accent */}
      <div style={{ borderTop: `5px solid ${primaryColor}` }} />
    </div>
  );
};

export const metadata = {
  id: 'ExecutiveLayout' as const,
  name: 'Executive',
  description: 'Premium serif layout with accent bands, formal spacing, and three-column competencies grid',
  suitableFor: ['executive-leadership', 'finance-banking', 'legal-law'],
  complexity: 'simple' as const,
  atsCompatibility: 'high' as const,
  isUnique: true,
};
