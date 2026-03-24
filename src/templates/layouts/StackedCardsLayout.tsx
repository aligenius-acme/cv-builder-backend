/**
 * StackedCardsLayout - Card-based layout where each experience entry is a floating card
 *
 * Structure: Photo + name header, summary card, section title with accent bar,
 *            each experience as a bordered card with date badge, colored chip skills
 * Suitable for: Entry-level students, tech startups
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const StackedCardsLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const skillStr = (s: any) => typeof s === 'string' ? s : s.category || s.name || String(s);
  const certStr = (c: any) => typeof c === 'string' ? c : c.name || '';
  const awardStr = (a: any) => typeof a === 'string' ? a : (a.name || '') + (a.date ? ` (${a.date})` : '');

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '22px 0 12px' }}>
      <div style={{ width: '4px', height: '16px', backgroundColor: primaryColor, borderRadius: '2px', flexShrink: 0 }} />
      <h2 style={{
        fontSize: `${fontSize.subheader - 1}px`,
        fontWeight: 700,
        color: primaryColor,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        margin: 0,
      }}>
        {children}
      </h2>
    </div>
  );

  const contactItems = [contact.email, contact.phone, contact.location, contact.linkedin, contact.github, contact.website].filter(Boolean);

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
      {/* Header */}
      <div style={{
        padding: `${margins.top + 10}px ${margins.left}px 20px`,
        borderBottom: `2px solid ${primaryColor}20`,
      }}>
        {contact.photoUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ flexShrink: 0 }}>
              <PhotoCircle
                photoUrl={contact.photoUrl}
                name={contact.name || 'User'}
                size="large"
                position="left"
                primaryColor={primaryColor}
              />
            </div>
            <div>
              <h1 style={{ fontSize: `${fontSize.header + 4}px`, fontWeight: 800, margin: 0, marginBottom: '4px', color: textColor }}>{contact.name || 'Your Name'}</h1>
              {experience && experience[0]?.title && (
                <div style={{ fontSize: `${fontSize.body + 1}px`, color: primaryColor, fontWeight: 600, marginBottom: '8px' }}>{experience[0].title}</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {contactItems.map((item, i) => (
                  <span key={i} style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: `${fontSize.header + 4}px`,
              fontWeight: 800,
              margin: 0,
              marginBottom: '4px',
              color: textColor,
              display: 'inline-block',
              borderBottom: `3px solid ${primaryColor}`,
              paddingBottom: '4px',
            }}>
              {contact.name || 'Your Name'}
            </h1>
            {experience && experience[0]?.title && (
              <div style={{ fontSize: `${fontSize.body + 1}px`, color: primaryColor, fontWeight: 600, marginBottom: '8px', marginTop: '4px' }}>{experience[0].title}</div>
            )}
            <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>
              {contactItems.join('  ·  ')}
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: `16px ${margins.right}px ${margins.bottom}px ${margins.left}px` }}>

        {summary && (
          <>
            <SectionTitle>About</SectionTitle>
            <div style={{
              backgroundColor: `${primaryColor}08`,
              borderRadius: '12px',
              padding: '16px 20px',
              borderLeft: `4px solid ${primaryColor}`,
            }}>
              <p style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.65, margin: 0 }}>{summary}</p>
            </div>
          </>
        )}

        {experience && experience.length > 0 && (
          <>
            <SectionTitle>Experience</SectionTitle>
            {experience.map((exp, i) => (
              <div key={i} style={{
                borderRadius: '8px',
                border: `1px solid ${primaryColor}20`,
                borderLeft: `4px solid ${primaryColor}`,
                padding: '14px 16px',
                marginBottom: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                backgroundColor: '#ffffff',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>{exp.title}</span>
                  <span style={{
                    backgroundColor: `${primaryColor}10`,
                    borderRadius: '20px',
                    padding: '2px 10px',
                    fontSize: `${fontSize.body - 1}px`,
                    color: primaryColor,
                    whiteSpace: 'nowrap',
                    fontWeight: 500,
                    flexShrink: 0,
                    marginLeft: '8px',
                  }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600, marginBottom: '6px' }}>
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                </div>
                {exp.description?.map((d, j) => (
                  <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.55, paddingLeft: '14px', marginBottom: '3px' }}>
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
                  backgroundColor: `${primaryColor}10`,
                  border: `1px solid ${primaryColor}25`,
                  color: primaryColor,
                  borderRadius: '6px',
                  padding: '4px 12px',
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
              <div key={i} style={{
                borderRadius: '8px',
                border: `1px solid ${primaryColor}20`,
                borderLeft: `4px solid ${primaryColor}`,
                padding: '12px 16px',
                marginBottom: '10px',
                backgroundColor: '#ffffff',
              }}>
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>{edu.degree}</div>
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
              <div key={i} style={{
                borderRadius: '8px',
                border: `1px solid ${primaryColor}20`,
                borderLeft: `4px solid ${primaryColor}`,
                padding: '12px 16px',
                marginBottom: '10px',
                backgroundColor: '#ffffff',
              }}>
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>
                  {p.name}{p.url ? <span style={{ fontWeight: 400, color: primaryColor, fontSize: `${fontSize.body - 1}px`, marginLeft: '8px' }}>{p.url}</span> : ''}
                </div>
                {p.description && (Array.isArray(p.description) && p.description.length > 1 ? (
                  <div style={{ margin: '4px 0' }}>
                    {p.description.map((d, di) => (
                      <div key={di} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.55, paddingLeft: '14px', marginBottom: '3px' }}>• {d}</div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.6 }}>{Array.isArray(p.description) ? (p.description[0] || '') : p.description}</div>
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
                <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>
                  <span style={{ color: primaryColor, marginRight: '6px' }}>▸</span>{certStr(c)}
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
                  backgroundColor: `${primaryColor}10`,
                  border: `1px solid ${primaryColor}25`,
                  color: primaryColor,
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: `${fontSize.body - 1}px`,
                  fontWeight: 600,
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
              <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginBottom: '4px' }}>
                <span style={{ color: primaryColor, marginRight: '6px' }}>★</span>{awardStr(a)}
              </div>
            ))}
          </>
        )}

        {volunteerWork && volunteerWork.length > 0 && (
          <>
            <SectionTitle>Volunteer</SectionTitle>
            {volunteerWork.map((v, i) => (
              <div key={i} style={{
                borderRadius: '8px',
                border: `1px solid ${primaryColor}20`,
                borderLeft: `4px solid ${primaryColor}`,
                padding: '12px 16px',
                marginBottom: '10px',
                backgroundColor: '#ffffff',
              }}>
                {typeof v === 'string' ? (
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>{v}</div>
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
  id: 'StackedCardsLayout' as const,
  name: 'Stacked Cards',
  description: 'Card-based design where each experience entry is a floating card with subtle shadow, colored chip skills, and accent-bar section headers',
  suitableFor: ['entry-student', 'tech-startup'],
  complexity: 'moderate' as const,
  atsCompatibility: 'medium' as const,
  isUnique: true,
};
