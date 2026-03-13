/**
 * TimelineDotsLayout - Proper vertical timeline with circle nodes on a spine line
 *
 * Structure: Simple name header, then experience as a vertical timeline with
 *            date column left, spine line, circle nodes, content right
 * Suitable for: ATS-professional, tech-startup, creative-design
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const TimelineDotsLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const skillStr = (s: any) => typeof s === 'string' ? s : s.category || s.name || String(s);
  const certStr = (c: any) => typeof c === 'string' ? c : c.name || '';
  const awardStr = (a: any) => typeof a === 'string' ? a : (a.name || '') + (a.date ? ` (${a.date})` : '');

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '22px 0 12px' }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: primaryColor, flexShrink: 0 }} />
      <h2 style={{
        fontSize: `${fontSize.subheader - 1}px`,
        fontWeight: 700,
        color: primaryColor,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        margin: 0,
        flex: 1,
        paddingBottom: '4px',
        borderBottom: `1px dashed ${primaryColor}25`,
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
      <div style={{ padding: `${margins.top + 8}px ${margins.left}px 14px`, display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: `${fontSize.header + 4}px`,
            fontWeight: 700,
            color: textColor,
            margin: 0,
            marginBottom: '4px',
            letterSpacing: '-0.3px',
          }}>
            {contact.name || 'Your Name'}
          </h1>
          {experience && experience[0]?.title && (
            <div style={{ fontSize: `${fontSize.body + 1}px`, color: primaryColor, fontWeight: 600, marginBottom: '8px' }}>
              {experience[0].title}
            </div>
          )}
          {contactItems.length > 0 && (
            <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, display: 'flex', flexWrap: 'wrap', gap: '0' }}>
              {contactItems.map((item, i) => (
                <span key={i}>
                  {i > 0 && <span style={{ margin: '0 8px', color: `${primaryColor}60` }}>·</span>}
                  {item}
                </span>
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

      {/* Full-width rule */}
      <div style={{ margin: `0 ${margins.left}px`, height: '1px', backgroundColor: `${primaryColor}25` }} />

      {/* Body */}
      <div style={{ padding: `8px ${margins.right}px ${margins.bottom}px ${margins.left}px` }}>

        {summary && (
          <>
            <SectionTitle>Summary</SectionTitle>
            <p style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.65, margin: '0 0 0 16px' }}>{summary}</p>
          </>
        )}

        {experience && experience.length > 0 && (
          <>
            <SectionTitle>Experience</SectionTitle>
            {/* Timeline container */}
            <div style={{ position: 'relative', paddingLeft: '80px' }}>
              {/* Vertical spine line */}
              <div style={{
                position: 'absolute',
                left: '56px',
                top: '6px',
                bottom: '6px',
                width: '2px',
                backgroundColor: `${primaryColor}30`,
              }} />

              {experience.map((exp, i) => (
                <div key={i} style={{ position: 'relative', marginBottom: '20px' }}>
                  {/* Date column */}
                  <div style={{
                    position: 'absolute',
                    left: '-80px',
                    width: '50px',
                    textAlign: 'right',
                  }}>
                    <div style={{ fontSize: `${fontSize.body - 2}px`, color: mutedColor, lineHeight: 1.4 }}>
                      {exp.startDate && <div>{exp.startDate}</div>}
                      <div>{exp.current ? 'Present' : exp.endDate}</div>
                    </div>
                  </div>

                  {/* Circle node */}
                  <div style={{
                    position: 'absolute',
                    left: '-28px',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: primaryColor,
                    border: '2px solid #ffffff',
                    outline: `1px solid ${primaryColor}`,
                  }} />

                  {/* Content */}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor, marginBottom: '2px' }}>{exp.title}</div>
                    <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600, marginBottom: '5px' }}>
                      {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                    </div>
                    {exp.description?.map((d, j) => (
                      <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.55, paddingLeft: '12px', marginBottom: '3px' }}>
                        • {d}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {skills && skills.length > 0 && (
          <>
            <SectionTitle>Skills</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '16px' }}>
              {(skills as any[]).map((s, i) => (
                <span key={i} style={{
                  border: `1px solid ${primaryColor}40`,
                  color: textColor,
                  borderRadius: '4px',
                  padding: '3px 10px',
                  fontSize: `${fontSize.body - 1}px`,
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
            <div style={{ paddingLeft: '16px' }}>
              {education.map((edu, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>{edu.degree}</div>
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>
                    {edu.institution}{edu.graduationDate ? ` · ${edu.graduationDate}` : ''}{edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {projects && projects.length > 0 && (
          <>
            <SectionTitle>Projects</SectionTitle>
            <div style={{ paddingLeft: '16px' }}>
              {projects.map((p, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>
                    {p.name}{p.url ? <span style={{ fontWeight: 400, color: primaryColor, fontSize: `${fontSize.body - 1}px`, marginLeft: '8px' }}>{p.url}</span> : ''}
                  </div>
                  {p.description && <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.6 }}>{p.description}</div>}
                  {(p.technologies?.length ?? 0) > 0 && (
                    <div style={{ fontSize: `${fontSize.body - 1}px`, color: primaryColor, fontWeight: 600, marginTop: '2px' }}>{p.technologies!.join(' · ')}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {certifications && certifications.length > 0 && (
          <>
            <SectionTitle>Certifications</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px 20px', paddingLeft: '16px' }}>
              {(certifications as any[]).map((c, i) => (
                <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>
                  • {certStr(c)}
                </div>
              ))}
            </div>
          </>
        )}

        {languages && languages.length > 0 && (
          <>
            <SectionTitle>Languages</SectionTitle>
            <div style={{ paddingLeft: '16px', fontSize: `${fontSize.body}px`, color: textColor }}>
              {languages.join('  ·  ')}
            </div>
          </>
        )}

        {awards && awards.length > 0 && (
          <>
            <SectionTitle>Awards</SectionTitle>
            <div style={{ paddingLeft: '16px' }}>
              {(awards as any[]).map((a, i) => (
                <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginBottom: '4px' }}>
                  • {awardStr(a)}
                </div>
              ))}
            </div>
          </>
        )}

        {volunteerWork && volunteerWork.length > 0 && (
          <>
            <SectionTitle>Volunteer</SectionTitle>
            <div style={{ paddingLeft: '16px' }}>
              {volunteerWork.map((v, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  {typeof v === 'string' ? (
                    <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>• {v}</div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 700, color: textColor }}>{v.role}</span>
                        <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>{v.startDate}{v.current ? ' – Present' : v.endDate ? ` – ${v.endDate}` : ''}</span>
                      </div>
                      <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor }}>{v.organization}</div>
                      {v.description?.map((d: string, j: number) => (
                        <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, paddingLeft: '12px' }}>• {d}</div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const metadata = {
  id: 'TimelineDotsLayout' as const,
  name: 'Timeline Dots',
  description: 'Vertical timeline with circle nodes on a spine line, date column left, content right — ideal for chronological career stories',
  suitableFor: ['ats-professional', 'tech-startup', 'creative-design'],
  complexity: 'complex' as const,
  atsCompatibility: 'medium' as const,
  isUnique: true,
};
