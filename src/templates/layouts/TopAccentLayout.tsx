/**
 * TopAccentLayout - Thick color strip at top, name left / contact right
 *
 * Structure: Prominent colored top strip, name left-aligned, contact right-aligned
 *            on same header row, ALL CAPS section titles with colored square dot prefix
 * Suitable for: All categories, especially tech and professional
 */

import * as React from 'react';
import { LayoutProps } from './types';

export const TopAccentLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const skillStr = (s: any) => typeof s === 'string' ? s : s.category || s.name || String(s);
  const certStr = (c: any) => typeof c === 'string' ? c : c.name || '';
  const awardStr = (a: any) => typeof a === 'string' ? a : (a.name || '') + (a.date ? ` (${a.date})` : '');

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '20px',
      marginBottom: '10px',
    }}>
      <div style={{
        width: '10px',
        height: '10px',
        backgroundColor: primaryColor,
        flexShrink: 0,
        borderRadius: '2px',
      }} />
      <h2 style={{
        fontSize: `${fontSize.body}px`,
        fontWeight: 800,
        color: textColor,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        margin: 0,
      }}>
        {children}
      </h2>
    </div>
  );

  return (
    <div style={{
      fontFamily: config.fontFamily || '"Segoe UI", Arial, sans-serif',
      fontSize: `${fontSize.body}px`,
      color: textColor,
      backgroundColor,
      maxWidth: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
    }}>
      {/* Top accent strip */}
      <div style={{ height: '8px', backgroundColor: primaryColor, width: '100%' }} />

      {/* Header row */}
      <div style={{
        padding: `20px ${margins.right}px 16px ${margins.left}px`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: `1px solid ${primaryColor}25`,
      }}>
        <div>
          <h1 style={{
            fontSize: `${fontSize.header + 2}px`,
            fontWeight: 800,
            color: textColor,
            letterSpacing: '-0.5px',
            marginBottom: '4px',
          }}>
            {contact.name || 'Your Name'}
          </h1>
          {experience && experience.length > 0 && (
            <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600 }}>
              {experience[0].title}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', fontSize: `${fontSize.body - 1}px`, color: mutedColor, lineHeight: 1.75, marginTop: '4px' }}>
          {[contact.email, contact.phone, contact.location, contact.linkedin, contact.github, contact.website]
            .filter(Boolean)
            .map((v, i) => <div key={i}>{v}</div>)}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: `8px ${margins.right}px ${margins.bottom}px ${margins.left}px` }}>
        {summary && (
          <>
            <SectionTitle>Summary</SectionTitle>
            <p style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.65 }}>{summary}</p>
          </>
        )}

        {experience && experience.length > 0 && (
          <>
            <SectionTitle>Experience</SectionTitle>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>{exp.title}</span>
                  <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, marginBottom: '4px', fontWeight: 500 }}>
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                </div>
                {exp.description?.map((d, j) => (
                  <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.55, paddingLeft: '14px', marginBottom: '3px' }}>
                    · {d}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {skills && skills.length > 0 && (
          <>
            <SectionTitle>Skills</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(skills as any[]).map((s, i) => (
                <span key={i} style={{
                  backgroundColor: `${primaryColor}12`,
                  color: primaryColor,
                  border: `1px solid ${primaryColor}30`,
                  padding: '3px 10px',
                  borderRadius: '3px',
                  fontSize: `${fontSize.body - 1}px`,
                  fontWeight: 600,
                }}>
                  {skillStr(s)}
                </span>
              ))}
            </div>
          </>
        )}

        {education && education.length > 0 && (
          <>
            <SectionTitle>Education</SectionTitle>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>{edu.degree}</div>
                <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>
                  {edu.institution}{edu.graduationDate ? ` · ${edu.graduationDate}` : ''}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                </div>
              </div>
            ))}
          </>
        )}

        {certifications && certifications.length > 0 && (
          <>
            <SectionTitle>Certifications</SectionTitle>
            {(certifications as any[]).map((c, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, paddingLeft: '14px', marginBottom: '4px' }}>
                · {certStr(c)}
              </div>
            ))}
          </>
        )}

        {projects && projects.length > 0 && (
          <>
            <SectionTitle>Projects</SectionTitle>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>
                  {p.name}{p.url ? ` — ${p.url}` : ''}
                </div>
                {p.description && <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.6 }}>{p.description}</div>}
                {(p.technologies?.length ?? 0) > 0 && (
                  <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>Tech: {p.technologies!.join(', ')}</div>
                )}
              </div>
            ))}
          </>
        )}

        {languages && languages.length > 0 && (
          <>
            <SectionTitle>Languages</SectionTitle>
            <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>
              {languages.join('  ·  ')}
            </div>
          </>
        )}

        {awards && awards.length > 0 && (
          <>
            <SectionTitle>Awards</SectionTitle>
            {(awards as any[]).map((a, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, paddingLeft: '14px', marginBottom: '4px' }}>
                · {awardStr(a)}
              </div>
            ))}
          </>
        )}

        {volunteerWork && volunteerWork.length > 0 && (
          <>
            <SectionTitle>Volunteer Work</SectionTitle>
            {volunteerWork.map((v, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                {typeof v === 'string' ? (
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, paddingLeft: '14px' }}>· {v}</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, color: textColor }}>{v.role}</span>
                      <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>
                        {v.startDate}{v.current ? ' – Present' : v.endDate ? ` – ${v.endDate}` : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginBottom: '4px' }}>{v.organization}</div>
                    {v.description?.map((d: string, j: number) => (
                      <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, paddingLeft: '14px', marginBottom: '3px' }}>· {d}</div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export const metadata = {
  id: 'TopAccentLayout' as const,
  name: 'Top Accent',
  description: 'Bold top color strip with name left and contact right, square-dot section markers throughout',
  suitableFor: ['all'],
  complexity: 'simple' as const,
  atsCompatibility: 'high' as const,
  isUnique: true,
};
