/**
 * DiagonalHeroLayout - Creative layout with geometric diagonal header
 *
 * Structure: Diagonal split header with colored left panel (clip-path polygon),
 *            name over color, contact on right, small colored-square section markers
 * Suitable for: Creative design, entry-level students
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const DiagonalHeroLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const skillStr = (s: any) => typeof s === 'string' ? s : s.category || s.name || String(s);
  const certStr = (c: any) => typeof c === 'string' ? c : c.name || '';
  const awardStr = (a: any) => typeof a === 'string' ? a : (a.name || '') + (a.date ? ` (${a.date})` : '');

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '22px 0 10px' }}>
      <div style={{ width: '8px', height: '8px', backgroundColor: primaryColor, borderRadius: '2px', flexShrink: 0 }} />
      <h2 style={{
        fontSize: `${fontSize.subheader - 1}px`,
        fontWeight: 700,
        color: textColor,
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
      {/* Diagonal hero header */}
      <div style={{ position: 'relative', height: '130px', overflow: 'hidden' }}>
        {/* Left colored diagonal panel */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '60%',
          height: '100%',
          backgroundColor: primaryColor,
          clipPath: 'polygon(0 0, 100% 0, 82% 100%, 0 100%)',
        }} />
        {/* Name and title over the colored panel */}
        <div style={{
          position: 'absolute',
          left: `${margins.left}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
        }}>
          <h1 style={{
            fontSize: `${fontSize.header + 8}px`,
            fontWeight: 800,
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: '-0.3px',
          }}>
            {contact.name || 'Your Name'}
          </h1>
          {experience && experience[0]?.title && (
            <div style={{ fontSize: `${fontSize.body}px`, color: 'rgba(255,255,255,0.85)', marginTop: '4px', fontWeight: 400 }}>
              {experience[0].title}
            </div>
          )}
        </div>
        {/* Contact + optional photo on the right */}
        <div style={{
          position: 'absolute',
          right: `${margins.right}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{ textAlign: 'right' }}>
            {contactItems.map((item, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, lineHeight: 1.7 }}>{item}</div>
            ))}
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
      </div>

      {/* Body */}
      <div style={{ padding: `16px ${margins.right}px ${margins.bottom}px ${margins.left}px` }}>

        {summary && (
          <>
            <SectionTitle>Summary</SectionTitle>
            <p style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.65, margin: 0 }}>{summary}</p>
          </>
        )}

        {experience && experience.length > 0 && (
          <>
            <SectionTitle>Experience</SectionTitle>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>{exp.title}</span>
                  <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600, marginBottom: '5px' }}>
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                </div>
                {exp.description?.map((d, j) => (
                  <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.55, marginBottom: '3px', display: 'flex', gap: '8px' }}>
                    <span style={{ color: primaryColor, fontWeight: 700, flexShrink: 0 }}>▸</span>
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
                  border: `1.5px solid ${primaryColor}`,
                  color: primaryColor,
                  borderRadius: '20px',
                  padding: '4px 14px',
                  fontSize: `${fontSize.body - 1}px`,
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
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>
                  {p.name}{p.url ? <span style={{ fontWeight: 400, color: primaryColor, fontSize: `${fontSize.body - 1}px`, marginLeft: '8px' }}>{p.url}</span> : ''}
                </div>
                {p.description && (Array.isArray(p.description) && p.description.length > 1 ? (
                  <div style={{ margin: '4px 0' }}>
                    {p.description.map((d, di) => (
                      <div key={di} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.55, marginBottom: '3px', display: 'flex', gap: '8px' }}>
                        <span style={{ color: primaryColor, fontWeight: 700, flexShrink: 0 }}>▸</span>
                        <span>{d}</span>
                      </div>
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
                  border: `1.5px solid ${primaryColor}`,
                  color: primaryColor,
                  borderRadius: '20px',
                  padding: '4px 14px',
                  fontSize: `${fontSize.body - 1}px`,
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
              <div key={i} style={{ marginBottom: '10px' }}>
                {typeof v === 'string' ? (
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>▸ {v}</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, color: textColor }}>{v.role}</span>
                      <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>{v.startDate}{v.current ? ' – Present' : v.endDate ? ` – ${v.endDate}` : ''}</span>
                    </div>
                    <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600 }}>{v.organization}{v.location ? ` · ${v.location}` : ''}</div>
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
  id: 'DiagonalHeroLayout' as const,
  name: 'Diagonal Hero',
  description: 'Creative geometric diagonal header with clip-path colored panel, name in white over color, outlined pill skills',
  suitableFor: ['creative-design', 'entry-student'],
  complexity: 'complex' as const,
  atsCompatibility: 'medium' as const,
  isUnique: true,
};
