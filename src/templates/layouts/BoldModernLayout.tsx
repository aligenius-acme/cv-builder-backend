/**
 * BoldModernLayout - High-impact bold typography layout
 *
 * Structure: Full-width dark header with white name, accent stripe,
 *            filled section title bars, pill skills
 * Suitable for: Tech, creative, entry-level standout candidates
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const BoldModernLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const skillStr = (s: any) => typeof s === 'string' ? s : s.category || s.name || String(s);
  const certStr = (c: any) => typeof c === 'string' ? c : c.name || '';
  const awardStr = (a: any) => typeof a === 'string' ? a : (a.name || '') + (a.date ? ` (${a.date})` : '');

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0 12px', gap: '12px' }}>
      <h2 style={{
        fontSize: `${fontSize.subheader}px`,
        fontWeight: 800,
        color: primaryColor,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        margin: 0,
        whiteSpace: 'nowrap',
      }}>
        {children}
      </h2>
      <div style={{ flex: 1, height: '2px', backgroundColor: primaryColor, opacity: 0.25 }} />
    </div>
  );

  const contactItems = [contact.email, contact.phone, contact.location, contact.linkedin, contact.github, contact.website].filter(Boolean);

  return (
    <div style={{
      fontFamily: '"Arial Black", Arial, sans-serif',
      fontSize: `${fontSize.body}px`,
      color: textColor,
      backgroundColor,
      maxWidth: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
    }}>
      {/* Full-Width Header */}
      <div style={{
        borderBottom: `3px solid ${primaryColor}`,
        padding: `${margins.top + 10}px ${margins.left}px 20px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: `${fontSize.header + 12}px`,
            fontWeight: 900,
            color: primaryColor,
            letterSpacing: '-1px',
            lineHeight: 1.05,
            margin: 0,
            textTransform: 'uppercase',
          }}>
            {contact.name || 'Your Name'}
          </h1>
          {experience && experience[0]?.title && (
            <div style={{
              fontSize: `${fontSize.body + 1}px`,
              color: mutedColor,
              marginTop: '8px',
              fontWeight: 400,
              letterSpacing: '0.5px',
            }}>
              {experience[0].title}
            </div>
          )}
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

      {/* Contact Bar */}
      <div style={{
        padding: '10px 40px',
        borderBottom: `1px solid ${primaryColor}20`,
      }}>
        <div style={{
          fontSize: `${fontSize.body - 1}px`,
          color: mutedColor,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px 20px',
        }}>
          {contactItems.map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: `16px ${margins.right}px ${margins.bottom}px ${margins.left}px` }}>

        {summary && (
          <>
            <SectionTitle>About</SectionTitle>
            <p style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.65, margin: 0 }}>{summary}</p>
          </>
        )}

        {skills && skills.length > 0 && (
          <>
            <SectionTitle>Skills</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(skills as any[]).map((s, i) => (
                <span key={i} style={{
                  color: primaryColor,
                  padding: '5px 14px',
                  borderRadius: '16px',
                  fontSize: `${fontSize.body - 1}px`,
                  fontWeight: 700,
                  border: `1.5px solid ${primaryColor}`,
                }}>
                  {skillStr(s)}
                </span>
              ))}
            </div>
          </>
        )}

        {experience && experience.length > 0 && (
          <>
            <SectionTitle>Experience</SectionTitle>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '18px', paddingLeft: '14px', borderLeft: `3px solid ${secondaryColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 800, fontSize: `${fontSize.subheader}px`, color: textColor }}>{exp.title}</span>
                  <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 700, marginBottom: '6px' }}>
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                </div>
                {exp.description?.map((d, j) => (
                  <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.55, marginBottom: '3px', display: 'flex', gap: '8px' }}>
                    <span style={{ color: secondaryColor, fontWeight: 700, flexShrink: 0 }}>▸</span>
                    <span>{d}</span>
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
              <div key={i} style={{ marginBottom: '10px', paddingLeft: '14px', borderLeft: `3px solid ${secondaryColor}` }}>
                <div style={{ fontWeight: 800, fontSize: `${fontSize.subheader - 1}px` }}>{edu.degree}</div>
                <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>
                  {edu.institution}{edu.graduationDate ? ` · ${edu.graduationDate}` : ''}{edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                </div>
              </div>
            ))}
          </>
        )}

        {projects && projects.length > 0 && (
          <>
            <SectionTitle>Projects</SectionTitle>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 800, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>
                  {p.name}{p.url ? <span style={{ fontWeight: 400, color: primaryColor, fontSize: `${fontSize.body - 1}px`, marginLeft: '8px' }}>{p.url}</span> : ''}
                </div>
                {p.description && <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.6 }}>{p.description}</div>}
                {(p.technologies?.length ?? 0) > 0 && (
                  <div style={{ fontSize: `${fontSize.body - 1}px`, color: primaryColor, fontWeight: 700, marginTop: '3px' }}>{p.technologies!.join(' · ')}</div>
                )}
              </div>
            ))}
          </>
        )}

        {certifications && certifications.length > 0 && (
          <>
            <SectionTitle>Certifications</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 20px' }}>
              {(certifications as any[]).map((c, i) => (
                <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>
                  <span style={{ color: secondaryColor, fontWeight: 700, marginRight: '6px' }}>▸</span>{certStr(c)}
                </div>
              ))}
            </div>
          </>
        )}

        {languages && languages.length > 0 && (
          <>
            <SectionTitle>Languages</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {languages.map((l, i) => (
                <span key={i} style={{ color: primaryColor, padding: '5px 14px', borderRadius: '16px', fontSize: `${fontSize.body - 1}px`, fontWeight: 700, border: `1.5px solid ${primaryColor}40` }}>{l}</span>
              ))}
            </div>
          </>
        )}

        {awards && awards.length > 0 && (
          <>
            <SectionTitle>Awards</SectionTitle>
            {(awards as any[]).map((a, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginBottom: '4px' }}>
                <span style={{ color: secondaryColor, fontWeight: 700, marginRight: '6px' }}>★</span>{awardStr(a)}
              </div>
            ))}
          </>
        )}

        {volunteerWork && volunteerWork.length > 0 && (
          <>
            <SectionTitle>Volunteer</SectionTitle>
            {volunteerWork.map((v, i) => (
              <div key={i} style={{ marginBottom: '10px', paddingLeft: '14px', borderLeft: `3px solid ${secondaryColor}` }}>
                {typeof v === 'string' ? (
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>{v}</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700 }}>{v.role}</span>
                      <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic' }}>
                        {v.startDate}{v.current ? ' – Present' : v.endDate ? ` – ${v.endDate}` : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600 }}>
                      {v.organization}{v.location ? ` · ${v.location}` : ''}
                    </div>
                    {v.description?.map((d: string, j: number) => (
                      <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginBottom: '3px' }}>▸ {d}</div>
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
  id: 'BoldModernLayout' as const,
  name: 'Bold Modern',
  description: 'High-impact layout with full-width dark header, 900-weight typography and accent borders',
  suitableFor: ['tech-startup', 'creative-design', 'entry-student'],
  complexity: 'moderate' as const,
  atsCompatibility: 'medium' as const,
  isUnique: true,
};
