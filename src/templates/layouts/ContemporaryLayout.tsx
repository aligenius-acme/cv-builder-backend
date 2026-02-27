/**
 * ContemporaryLayout - Full-width colour band header
 *
 * Structure: Full-width primaryColor header band (name + contact in white),
 *            white content below with left-accent-bar section titles, tag-style skills
 * Suitable for: All categories
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const ContemporaryLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const skillStr = (s: any) => typeof s === 'string' ? s : s.category || s.name || String(s);
  const certStr = (c: any) => typeof c === 'string' ? c : c.name || '';
  const awardStr = (a: any) => typeof a === 'string' ? a : (a.name || '') + (a.date ? ` (${a.date})` : '');

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 style={{
      fontSize: `${fontSize.subheader}px`,
      fontWeight: 700,
      color: textColor,
      borderLeft: `4px solid ${primaryColor}`,
      paddingLeft: '12px',
      marginTop: '20px',
      marginBottom: '10px',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
    }}>
      {children}
    </h2>
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
      {/* Full-width header */}
      <div style={{
        borderBottom: `3px solid ${primaryColor}`,
        padding: `32px ${margins.right}px 28px ${margins.left}px`,
        marginBottom: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: `${fontSize.header + 2}px`,
            fontWeight: 700,
            color: primaryColor,
            marginBottom: '8px',
            letterSpacing: '0.3px',
          }}>
            {contact.name || 'Your Name'}
          </h1>
          <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.7 }}>
            {[contact.email, contact.phone, contact.location, contact.linkedin, contact.github, contact.website]
              .filter(Boolean)
              .join('  ·  ')}
          </div>
        </div>
        {contact.photoUrl && (
          <div style={{ flexShrink: 0 }}>
            <PhotoCircle
              photoUrl={contact.photoUrl}
              name={contact.name || 'User'}
              size="small"
              position="right"
              primaryColor={primaryColor}
            />
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ padding: `20px ${margins.right}px ${margins.bottom}px ${margins.left}px` }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px` }}>{exp.title}</span>
                  <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic' }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginBottom: '4px' }}>
                  {exp.company}{exp.location ? ` • ${exp.location}` : ''}
                </div>
                {exp.description?.map((d, j) => (
                  <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.55, marginLeft: '14px', marginBottom: '3px' }}>
                    • {d}
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
                  color: primaryColor,
                  border: `1px solid ${primaryColor}35`,
                  padding: '3px 9px',
                  borderRadius: '4px',
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
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px` }}>{edu.degree}</div>
                <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>
                  {edu.institution}{edu.graduationDate ? ` • ${edu.graduationDate}` : ''}{edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                </div>
              </div>
            ))}
          </>
        )}

        {certifications && certifications.length > 0 && (
          <>
            <SectionTitle>Certifications</SectionTitle>
            {(certifications as any[]).map((c, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginLeft: '14px', marginBottom: '4px' }}>
                • {certStr(c)}
              </div>
            ))}
          </>
        )}

        {projects && projects.length > 0 && (
          <>
            <SectionTitle>Projects</SectionTitle>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px` }}>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {languages.map((l, i) => (
                <span key={i} style={{ color: primaryColor, border: `1px solid ${primaryColor}35`, padding: '3px 9px', borderRadius: '4px', fontSize: `${fontSize.body - 1}px`, fontWeight: 600 }}>{l}</span>
              ))}
            </div>
          </>
        )}

        {awards && awards.length > 0 && (
          <>
            <SectionTitle>Awards</SectionTitle>
            {(awards as any[]).map((a, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginLeft: '14px', marginBottom: '4px' }}>• {awardStr(a)}</div>
            ))}
          </>
        )}

        {volunteerWork && volunteerWork.length > 0 && (
          <>
            <SectionTitle>Volunteer Work</SectionTitle>
            {volunteerWork.map((v, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                {typeof v === 'string' ? (
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginLeft: '14px' }}>• {v}</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700 }}>{v.role}</span>
                      <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic' }}>
                        {v.startDate}{v.current ? ' – Present' : v.endDate ? ` – ${v.endDate}` : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginBottom: '4px' }}>
                      {v.organization}{v.location ? ` • ${v.location}` : ''}
                    </div>
                    {v.description?.map((d: string, j: number) => (
                      <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginLeft: '14px', marginBottom: '3px' }}>• {d}</div>
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
  id: 'ContemporaryLayout' as const,
  name: 'Contemporary',
  description: 'Modern design with full-width colour header band and accent-bar section titles',
  suitableFor: ['all'],
  complexity: 'moderate' as const,
  atsCompatibility: 'high' as const,
  isUnique: true,
};
