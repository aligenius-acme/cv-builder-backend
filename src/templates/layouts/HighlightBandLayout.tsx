/**
 * HighlightBandLayout - ATS-safe single column with full-width colored section title bands
 *
 * Structure: Clean header with contact grid, full-width primaryColor section title bands,
 *            alternating row backgrounds for experience, 3-column plain skills grid
 * Suitable for: ATS-professional, academic-research, entry-student
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const HighlightBandLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const skillStr = (s: any) => typeof s === 'string' ? s : s.category || s.name || String(s);
  const certStr = (c: any) => typeof c === 'string' ? c : c.name || '';
  const awardStr = (a: any) => typeof a === 'string' ? a : (a.name || '') + (a.date ? ` (${a.date})` : '');

  const SectionBand: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{
      backgroundColor: primaryColor,
      padding: '5px 20px',
      margin: '16px 0 0',
      color: '#ffffff',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      fontSize: `${fontSize.body}px`,
    }}>
      {children}
    </div>
  );

  const contactItems = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.github,
    contact.website,
  ].filter(Boolean);

  return (
    <div style={{
      fontFamily: config.fontFamily || '"Calibri", Arial, sans-serif',
      fontSize: `${fontSize.body}px`,
      color: textColor,
      backgroundColor,
      maxWidth: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ padding: `${margins.top}px ${margins.left}px 16px`, display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ flex: 1 }}>
        <h1 style={{
          fontSize: `${fontSize.header + 4}px`,
          fontWeight: 700,
          color: primaryColor,
          margin: 0,
          marginBottom: '4px',
          letterSpacing: '-0.3px',
        }}>
          {contact.name || 'Your Name'}
        </h1>
        {experience && experience[0]?.title && (
          <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginBottom: '12px' }}>
            {experience[0].title}
          </div>
        )}
        {/* Contact grid */}
        {contactItems.length > 0 && (
          <div style={{
            backgroundColor: `${primaryColor}08`,
            borderRadius: '4px',
            padding: '8px 14px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3px 20px',
          }}>
            {contactItems.map((item, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>{item}</div>
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
            <SectionBand>Summary</SectionBand>
            <div style={{ padding: '10px 20px', backgroundColor: '#ffffff' }}>
              <p style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.65, margin: 0 }}>{summary}</p>
            </div>
          </>
        )}

        {experience && experience.length > 0 && (
          <>
            <SectionBand>Experience</SectionBand>
            {experience.map((exp, i) => (
              <div key={i} style={{
                backgroundColor: i % 2 === 0 ? '#fafafa' : '#ffffff',
                padding: '10px 20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>{exp.title}</span>
                  <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600, marginBottom: '5px' }}>
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
            <SectionBand>Skills</SectionBand>
            <div style={{
              padding: '10px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px 12px',
            }}>
              {(skills as any[]).map((s, i) => (
                <div key={i} style={{ fontSize: `${fontSize.body}px`, color: textColor }}>
                  · {skillStr(s)}
                </div>
              ))}
            </div>
          </>
        )}

        {education && education.length > 0 && (
          <>
            <SectionBand>Education</SectionBand>
            {education.map((edu, i) => (
              <div key={i} style={{
                backgroundColor: i % 2 === 0 ? '#fafafa' : '#ffffff',
                padding: '10px 20px',
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
            <SectionBand>Projects</SectionBand>
            {projects.map((p, i) => (
              <div key={i} style={{
                backgroundColor: i % 2 === 0 ? '#fafafa' : '#ffffff',
                padding: '10px 20px',
              }}>
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>
                  {p.name}{p.url ? <span style={{ fontWeight: 400, color: primaryColor, fontSize: `${fontSize.body - 1}px`, marginLeft: '8px' }}>{p.url}</span> : ''}
                </div>
                {p.description && <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.6 }}>{p.description}</div>}
                {(p.technologies?.length ?? 0) > 0 && (
                  <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>Tech: {p.technologies!.join(', ')}</div>
                )}
              </div>
            ))}
          </>
        )}

        {certifications && certifications.length > 0 && (
          <>
            <SectionBand>Certifications</SectionBand>
            <div style={{
              padding: '10px 20px',
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
            <SectionBand>Languages</SectionBand>
            <div style={{ padding: '10px 20px' }}>
              <div style={{ fontSize: `${fontSize.body}px`, color: textColor }}>{languages.join('  ·  ')}</div>
            </div>
          </>
        )}

        {awards && awards.length > 0 && (
          <>
            <SectionBand>Awards</SectionBand>
            {(awards as any[]).map((a, i) => (
              <div key={i} style={{
                backgroundColor: i % 2 === 0 ? '#fafafa' : '#ffffff',
                padding: '8px 20px',
                fontSize: `${fontSize.body}px`,
                color: mutedColor,
              }}>
                • {awardStr(a)}
              </div>
            ))}
          </>
        )}

        {volunteerWork && volunteerWork.length > 0 && (
          <>
            <SectionBand>Volunteer Work</SectionBand>
            {volunteerWork.map((v, i) => (
              <div key={i} style={{
                backgroundColor: i % 2 === 0 ? '#fafafa' : '#ffffff',
                padding: '10px 20px',
              }}>
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
  id: 'HighlightBandLayout' as const,
  name: 'Highlight Band',
  description: 'ATS-safe single column with full-width colored section title bands and alternating row backgrounds for maximum readability',
  suitableFor: ['ats-professional', 'academic-research'],
  complexity: 'simple' as const,
  atsCompatibility: 'high' as const,
  isUnique: true,
};
