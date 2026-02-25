/**
 * ClassicLayout - Traditional serif layout
 *
 * Structure: Centered header with decorative HR, Georgia serif font,
 *            underline section titles (no uppercase), inline skills
 * Suitable for: Executive, academic, legal, traditional industries
 */

import * as React from 'react';
import { LayoutProps } from './types';

export const ClassicLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const photoUrl = contact.photoUrl || (data as any).photoUrl;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const skillStr = (s: any) => typeof s === 'string' ? s : s.category || s.name || String(s);
  const certStr = (c: any) => typeof c === 'string' ? c : c.name || '';
  const awardStr = (a: any) => typeof a === 'string' ? a : (a.name || '') + (a.date ? ` (${a.date})` : '');

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 style={{
      fontSize: `${fontSize.subheader + 1}px`,
      fontWeight: 700,
      color: primaryColor,
      borderBottom: `1.5px solid ${primaryColor}`,
      paddingBottom: '5px',
      marginTop: '22px',
      marginBottom: '12px',
      letterSpacing: '0.3px',
    }}>
      {children}
    </h2>
  );

  return (
    <div style={{
      fontFamily: config.fontFamily || 'Georgia, "Times New Roman", serif',
      fontSize: `${fontSize.body + 0.5}px`,
      color: textColor,
      backgroundColor,
      padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
      maxWidth: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
    }}>
      {/* Centered Header */}
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        {photoUrl && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `2px solid ${primaryColor}`,
            }}>
              <img src={photoUrl} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        )}
        <h1 style={{
          fontSize: `${fontSize.header}px`,
          fontWeight: 700,
          color: textColor,
          letterSpacing: '2px',
          marginBottom: '6px',
        }}>
          {(contact.name || 'Your Name').toUpperCase()}
        </h1>
        <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, marginBottom: '10px' }}>
          {[contact.email, contact.phone, contact.location, contact.linkedin, contact.github]
            .filter(Boolean)
            .join('  ·  ')}
        </div>
        <hr style={{ border: 'none', borderTop: '1.5px solid #bbb', margin: '0' }} />
      </div>

      {summary && (
        <>
          <SectionTitle>Professional Summary</SectionTitle>
          <p style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.7, fontStyle: 'italic' }}>{summary}</p>
        </>
      )}

      {experience && experience.length > 0 && (
        <>
          <SectionTitle>Professional Experience</SectionTitle>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                <span style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px` }}>{exp.title}</span>
                <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic' }}>
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              <div style={{ fontSize: `${fontSize.body}px`, color: secondaryColor, fontStyle: 'italic', marginBottom: '5px' }}>
                {exp.company}{exp.location ? `, ${exp.location}` : ''}
              </div>
              {exp.description?.map((d, j) => (
                <div key={j} style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, marginLeft: '18px', marginBottom: '3px' }}>
                  – {d}
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {education && education.length > 0 && (
        <>
          <SectionTitle>Education</SectionTitle>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px` }}>{edu.degree}</div>
              <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, fontStyle: 'italic' }}>
                {edu.institution}{edu.location ? `, ${edu.location}` : ''}{edu.graduationDate ? `, ${edu.graduationDate}` : ''}{edu.gpa ? ` (GPA: ${edu.gpa})` : ''}
              </div>
            </div>
          ))}
        </>
      )}

      {skills && skills.length > 0 && (
        <>
          <SectionTitle>Core Competencies</SectionTitle>
          <p style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.8 }}>
            {(skills as any[]).map(s => skillStr(s)).join('  •  ')}
          </p>
        </>
      )}

      {certifications && certifications.length > 0 && (
        <>
          <SectionTitle>Certifications</SectionTitle>
          {(certifications as any[]).map((c, i) => (
            <div key={i} style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.7, marginLeft: '18px', marginBottom: '3px' }}>
              – {certStr(c)}
            </div>
          ))}
        </>
      )}

      {projects && projects.length > 0 && (
        <>
          <SectionTitle>Selected Projects</SectionTitle>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px` }}>{p.name}</div>
              {p.description && <div style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, marginLeft: '18px' }}>– {p.description}</div>}
              {p.technologies?.length > 0 && (
                <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic', marginLeft: '18px' }}>
                  Technologies: {p.technologies.join(', ')}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {languages && languages.length > 0 && (
        <>
          <SectionTitle>Languages</SectionTitle>
          <p style={{ fontSize: `${fontSize.body}px`, color: textColor }}>{languages.join('  •  ')}</p>
        </>
      )}

      {awards && awards.length > 0 && (
        <>
          <SectionTitle>Honours &amp; Awards</SectionTitle>
          {(awards as any[]).map((a, i) => (
            <div key={i} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginLeft: '18px', marginBottom: '4px' }}>
              – {awardStr(a)}
            </div>
          ))}
        </>
      )}

      {volunteerWork && volunteerWork.length > 0 && (
        <>
          <SectionTitle>Community Involvement</SectionTitle>
          {volunteerWork.map((v, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              {typeof v === 'string' ? (
                <div style={{ fontSize: `${fontSize.body}px`, color: textColor, marginLeft: '18px' }}>– {v}</div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px` }}>{v.role}</span>
                    <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic' }}>
                      {v.startDate}{v.current ? ' – Present' : v.endDate ? ` – ${v.endDate}` : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: `${fontSize.body}px`, color: secondaryColor, fontStyle: 'italic', marginBottom: '4px' }}>
                    {v.organization}{v.location ? `, ${v.location}` : ''}
                  </div>
                  {v.description?.map((d: string, j: number) => (
                    <div key={j} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginLeft: '18px', marginBottom: '3px' }}>– {d}</div>
                  ))}
                </>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export const metadata = {
  id: 'ClassicLayout' as const,
  name: 'Classic',
  description: 'Traditional serif layout with centered header and elegant underline section dividers',
  suitableFor: ['all'],
  complexity: 'simple' as const,
  atsCompatibility: 'high' as const,
  isUnique: true,
};
