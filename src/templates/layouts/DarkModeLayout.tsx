/**
 * DarkModeLayout - Dark navy background for tech/startup professionals
 *
 * Structure: Dark #0f172a background, white/light text, primaryColor accents,
 *            monospace skill chips, left-bordered experience entries
 * Suitable for: Tech startups, creative design, entry-level tech
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const DarkModeLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const { primaryColor, textColor, mutedColor, fontSize, margins } = config;

  const skillStr = (s: any) => typeof s === 'string' ? s : s.category || s.name || String(s);
  const certStr = (c: any) => typeof c === 'string' ? c : c.name || '';
  const awardStr = (a: any) => typeof a === 'string' ? a : (a.name || '') + (a.date ? ` (${a.date})` : '');

  const darkBg = '#0f172a';
  const lightText = '#e2e8f0';
  const mutedLight = 'rgba(255,255,255,0.55)';

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ marginTop: '22px', marginBottom: '12px' }}>
      <h2 style={{
        fontSize: `${fontSize.subheader}px`,
        fontWeight: 800,
        color: primaryColor,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        margin: 0,
        paddingBottom: '6px',
        borderBottom: `1px solid ${primaryColor}4d`,
      }}>
        {children}
      </h2>
    </div>
  );

  const contactItems = [contact.email, contact.phone, contact.location, contact.linkedin, contact.github, contact.website].filter(Boolean);

  return (
    <div style={{
      fontFamily: '"Segoe UI", "Inter", Arial, sans-serif',
      fontSize: `${fontSize.body}px`,
      color: lightText,
      backgroundColor: darkBg,
      maxWidth: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        padding: `${margins.top + 10}px ${margins.left}px 20px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        borderBottom: `1px solid ${primaryColor}30`,
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: `${fontSize.header + 10}px`,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.5px',
            lineHeight: 1.05,
            margin: 0,
            marginBottom: '6px',
          }}>
            {contact.name || 'Your Name'}
          </h1>
          {experience && experience[0]?.title && (
            <div style={{
              fontSize: `${fontSize.body + 1}px`,
              color: primaryColor,
              fontWeight: 600,
              marginBottom: '10px',
            }}>
              {experience[0].title}
            </div>
          )}
          {contactItems.length > 0 && (
            <div style={{
              fontSize: `${fontSize.body - 1}px`,
              color: 'rgba(255,255,255,0.5)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0',
            }}>
              {contactItems.map((item, i) => (
                <span key={i}>
                  {i > 0 && <span style={{ margin: '0 8px', color: `${primaryColor}80` }}>·</span>}
                  {item}
                </span>
              ))}
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

      {/* Body */}
      <div style={{ padding: `16px ${margins.right}px ${margins.bottom}px ${margins.left}px` }}>

        {summary && (
          <>
            <SectionTitle>About</SectionTitle>
            <p style={{ fontSize: `${fontSize.body}px`, color: mutedLight, lineHeight: 1.65, margin: 0 }}>{summary}</p>
          </>
        )}

        {experience && experience.length > 0 && (
          <>
            <SectionTitle>Experience</SectionTitle>
            {experience.map((exp, i) => (
              <div key={i} style={{
                marginBottom: '18px',
                paddingLeft: '16px',
                borderLeft: `3px solid ${primaryColor}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 700, fontSize: `${fontSize.subheader}px`, color: '#ffffff' }}>{exp.title}</span>
                  <span style={{ fontSize: `${fontSize.body - 1}px`, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600, marginBottom: '6px' }}>
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                </div>
                {exp.description?.map((d, j) => (
                  <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedLight, lineHeight: 1.55, marginBottom: '3px', display: 'flex', gap: '8px' }}>
                    <span style={{ color: primaryColor, fontWeight: 700, flexShrink: 0 }}>{'>'}</span>
                    <span>{d}</span>
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
                  backgroundColor: `${primaryColor}20`,
                  border: `1px solid ${primaryColor}60`,
                  color: primaryColor,
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: `${fontSize.body - 1}px`,
                  fontFamily: '"Consolas", "Monaco", monospace',
                  fontWeight: 500,
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
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: '#ffffff' }}>{edu.degree}</div>
                <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600 }}>
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
              <div key={i} style={{ marginBottom: '12px', paddingLeft: '16px', borderLeft: `3px solid ${primaryColor}` }}>
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: '#ffffff' }}>
                  {p.name}{p.url ? <span style={{ fontWeight: 400, color: primaryColor, fontSize: `${fontSize.body - 1}px`, marginLeft: '8px' }}>{p.url}</span> : ''}
                </div>
                {p.description && (Array.isArray(p.description) && p.description.length > 1 ? (
                  <ul style={{ margin: '4px 0', paddingLeft: '18px', listStyleType: 'disc' }}>
                    {p.description.map((d, di) => (
                      <li key={di} style={{ fontSize: `${fontSize.body}px`, color: mutedLight, lineHeight: 1.6, marginBottom: '2px' }}>{d}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedLight, lineHeight: 1.6 }}>{Array.isArray(p.description) ? (p.description[0] || '') : p.description}</div>
                ))}
                {(p.technologies?.length ?? 0) > 0 && (
                  <div style={{ fontSize: `${fontSize.body - 1}px`, color: primaryColor, fontWeight: 600, marginTop: '3px' }}>{p.technologies!.join(' · ')}</div>
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
                <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedLight }}>
                  <span style={{ color: primaryColor, fontWeight: 700, marginRight: '6px' }}>{'>'}</span>{certStr(c)}
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
                <span key={i} style={{
                  backgroundColor: `${primaryColor}20`,
                  border: `1px solid ${primaryColor}60`,
                  color: primaryColor,
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: `${fontSize.body - 1}px`,
                  fontFamily: '"Consolas", "Monaco", monospace',
                }}>
                  {l}
                </span>
              ))}
            </div>
          </>
        )}

        {awards && awards.length > 0 && (
          <>
            <SectionTitle>Awards</SectionTitle>
            {(awards as any[]).map((a, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedLight, marginBottom: '4px' }}>
                <span style={{ color: primaryColor, fontWeight: 700, marginRight: '6px' }}>★</span>{awardStr(a)}
              </div>
            ))}
          </>
        )}

        {volunteerWork && volunteerWork.length > 0 && (
          <>
            <SectionTitle>Volunteer</SectionTitle>
            {volunteerWork.map((v, i) => (
              <div key={i} style={{ marginBottom: '10px', paddingLeft: '16px', borderLeft: `3px solid ${primaryColor}` }}>
                {typeof v === 'string' ? (
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedLight }}>{v}</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, color: '#ffffff' }}>{v.role}</span>
                      <span style={{ fontSize: `${fontSize.body - 1}px`, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                        {v.startDate}{v.current ? ' – Present' : v.endDate ? ` – ${v.endDate}` : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600 }}>
                      {v.organization}{v.location ? ` · ${v.location}` : ''}
                    </div>
                    {v.description?.map((d: string, j: number) => (
                      <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedLight, marginBottom: '3px' }}>{'>'} {d}</div>
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
  id: 'DarkModeLayout' as const,
  name: 'Dark Mode',
  description: 'Dark navy background with primaryColor accents, monospace skill chips and left-bordered experience entries for tech professionals',
  suitableFor: ['tech-startup', 'creative-design'],
  complexity: 'moderate' as const,
  atsCompatibility: 'medium' as const,
  isUnique: true,
};
