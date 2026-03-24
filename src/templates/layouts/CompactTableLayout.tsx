/**
 * CompactTableLayout - Finance/consulting structured table layout
 *
 * Structure: Name with bordered table-style contact row, band section titles,
 *            structured experience with bordered entry headers, 3-column skills grid
 * Suitable for: ATS-professional, academic-research, executive-leadership
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const CompactTableLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const skillStr = (s: any) => typeof s === 'string' ? s : s.category || s.name || String(s);
  const certStr = (c: any) => typeof c === 'string' ? c : c.name || '';
  const awardStr = (a: any) => typeof a === 'string' ? a : (a.name || '') + (a.date ? ` (${a.date})` : '');

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{
      backgroundColor: `${primaryColor}08`,
      border: `1px solid ${primaryColor}20`,
      borderLeft: `3px solid ${primaryColor}`,
      padding: '4px 14px',
      margin: '16px 0 0',
      color: textColor,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      fontSize: `${fontSize.body}px`,
    }}>
      {children}
    </div>
  );

  const contactCells = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.github,
    contact.website,
  ].filter(Boolean);

  return (
    <div style={{
      fontFamily: config.fontFamily || '"Calibri", "Segoe UI", Arial, sans-serif',
      fontSize: `${fontSize.body}px`,
      color: textColor,
      backgroundColor,
      maxWidth: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ padding: `${margins.top}px ${margins.left}px 12px`, display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ flex: 1 }}>
        <h1 style={{
          fontSize: `${fontSize.header + 4}px`,
          fontWeight: 700,
          color: primaryColor,
          margin: 0,
          marginBottom: '8px',
          letterSpacing: '-0.3px',
        }}>
          {contact.name || 'Your Name'}
        </h1>
        {experience && experience[0]?.title && (
          <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginBottom: '8px' }}>
            {experience[0].title}
          </div>
        )}
        {/* Contact table row */}
        {contactCells.length > 0 && (
          <div style={{
            display: 'flex',
            border: `1px solid ${primaryColor}30`,
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            {contactCells.map((item, i) => (
              <div key={i} style={{
                padding: '4px 12px',
                fontSize: `${fontSize.body - 1}px`,
                color: mutedColor,
                borderRight: i < contactCells.length - 1 ? `1px solid ${primaryColor}20` : 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
              }}>
                {item}
              </div>
            ))}
          </div>
        )}
        </div>
        {contact.photoUrl && (
          <PhotoCircle
            photoUrl={contact.photoUrl}
            name={contact.name || 'User'}
            size="small"
            position="right"
            primaryColor={primaryColor}
          />
        )}
      </div>

      <div style={{ padding: `0 ${margins.left}px ${margins.bottom}px` }}>

        {summary && (
          <>
            <SectionTitle>Summary</SectionTitle>
            <div style={{ padding: '10px 14px', border: `1px solid ${primaryColor}15`, borderTop: 'none' }}>
              <p style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.65, margin: 0 }}>{summary}</p>
            </div>
          </>
        )}

        {experience && experience.length > 0 && (
          <>
            <SectionTitle>Professional Experience</SectionTitle>
            {experience.map((exp, i) => (
              <div key={i} style={{ border: `1px solid #e5e7eb`, borderTop: i === 0 ? 'none' : '1px solid #e5e7eb', marginBottom: '0' }}>
                {/* Entry header row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                  padding: '5px 14px',
                }}>
                  <span style={{ fontWeight: 700, fontSize: `${fontSize.body}px`, color: textColor }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</span>
                  <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, whiteSpace: 'nowrap' }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {/* Title sub-row */}
                <div style={{ padding: '4px 14px 2px', fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600, backgroundColor: '#ffffff' }}>
                  {exp.title}
                </div>
                {/* Bullets */}
                <div style={{ padding: '4px 14px 10px', backgroundColor: '#ffffff' }}>
                  {exp.description?.map((d, j) => (
                    <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.55, paddingLeft: '14px', marginBottom: '2px' }}>
                      • {d}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {skills && skills.length > 0 && (
          <>
            <SectionTitle>Skills</SectionTitle>
            <div style={{
              border: `1px solid ${primaryColor}15`,
              borderTop: 'none',
              padding: '10px 14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px 12px',
            }}>
              {(skills as any[]).map((s, i) => (
                <div key={i} style={{
                  border: `1px solid ${primaryColor}15`,
                  padding: '3px 8px',
                  fontSize: `${fontSize.body}px`,
                  color: textColor,
                }}>
                  {skillStr(s)}
                </div>
              ))}
            </div>
          </>
        )}

        {education && education.length > 0 && (
          <>
            <SectionTitle>Education</SectionTitle>
            {education.map((edu, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '8px 14px',
                border: `1px solid ${primaryColor}15`,
                borderTop: i === 0 ? 'none' : `1px solid ${primaryColor}15`,
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: `${fontSize.body}px`, color: textColor }}>{edu.degree}</div>
                  <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>{edu.institution}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {edu.graduationDate && <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>{edu.graduationDate}</div>}
                  {edu.gpa && <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>GPA {edu.gpa}</div>}
                </div>
              </div>
            ))}
          </>
        )}

        {projects && projects.length > 0 && (
          <>
            <SectionTitle>Projects</SectionTitle>
            {projects.map((p, i) => (
              <div key={i} style={{ padding: '8px 14px', border: `1px solid ${primaryColor}15`, borderTop: i === 0 ? 'none' : `1px solid ${primaryColor}15` }}>
                <div style={{ fontWeight: 700, fontSize: `${fontSize.body}px`, color: textColor }}>
                  {p.name}{p.url ? <span style={{ fontWeight: 400, color: primaryColor, fontSize: `${fontSize.body - 1}px`, marginLeft: '8px' }}>{p.url}</span> : ''}
                </div>
                {p.description && (Array.isArray(p.description) && p.description.length > 1 ? (
                  <ul style={{ margin: '4px 0', paddingLeft: '18px', listStyleType: 'disc' }}>
                    {p.description.map((d, di) => (
                      <li key={di} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.6, marginBottom: '2px' }}>{d}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.6 }}>{Array.isArray(p.description) ? (p.description[0] || '') : p.description}</div>
                ))}
                {(p.technologies?.length ?? 0) > 0 && (
                  <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>Tech: {p.technologies!.join(', ')}</div>
                )}
              </div>
            ))}
          </>
        )}

        {certifications && certifications.length > 0 && (
          <>
            <SectionTitle>Certifications</SectionTitle>
            <div style={{
              border: `1px solid ${primaryColor}15`,
              borderTop: 'none',
              padding: '10px 14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '4px 20px',
            }}>
              {(certifications as any[]).map((c, i) => (
                <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>• {certStr(c)}</div>
              ))}
            </div>
          </>
        )}

        {languages && languages.length > 0 && (
          <>
            <SectionTitle>Languages</SectionTitle>
            <div style={{ border: `1px solid ${primaryColor}15`, borderTop: 'none', padding: '8px 14px' }}>
              <div style={{ fontSize: `${fontSize.body}px`, color: textColor }}>{languages.join('  ·  ')}</div>
            </div>
          </>
        )}

        {awards && awards.length > 0 && (
          <>
            <SectionTitle>Awards</SectionTitle>
            <div style={{ border: `1px solid ${primaryColor}15`, borderTop: 'none', padding: '8px 14px' }}>
              {(awards as any[]).map((a, i) => (
                <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginBottom: '4px' }}>• {awardStr(a)}</div>
              ))}
            </div>
          </>
        )}

        {volunteerWork && volunteerWork.length > 0 && (
          <>
            <SectionTitle>Volunteer Work</SectionTitle>
            {volunteerWork.map((v, i) => (
              <div key={i} style={{ padding: '8px 14px', border: `1px solid ${primaryColor}15`, borderTop: i === 0 ? 'none' : `1px solid ${primaryColor}15` }}>
                {typeof v === 'string' ? (
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>• {v}</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, color: textColor }}>{v.role}</span>
                      <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>{v.startDate}{v.current ? ' – Present' : v.endDate ? ` – ${v.endDate}` : ''}</span>
                    </div>
                    <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600 }}>{v.organization}</div>
                    {v.description?.map((d: string, j: number) => (
                      <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, paddingLeft: '14px' }}>• {d}</div>
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
  id: 'CompactTableLayout' as const,
  name: 'Compact Table',
  description: 'Finance/consulting structured table layout with bordered experience entries, band section titles, and 3-column skills grid',
  suitableFor: ['ats-professional', 'academic-research'],
  complexity: 'moderate' as const,
  atsCompatibility: 'high' as const,
  isUnique: true,
};
