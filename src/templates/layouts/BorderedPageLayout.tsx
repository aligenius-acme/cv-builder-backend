/**
 * BorderedPageLayout - Thin colored border framing the entire page
 *
 * Structure: Thin colored border around entire page, large centered name with
 *            decorative double-rule, premium executive feel with serif typography
 * Suitable for: Executive, legal, academic, traditional
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const BorderedPageLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const skillStr = (s: any) => typeof s === 'string' ? s : s.category || s.name || String(s);
  const certStr = (c: any) => typeof c === 'string' ? c : c.name || '';
  const awardStr = (a: any) => typeof a === 'string' ? a : (a.name || '') + (a.date ? ` (${a.date})` : '');

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ marginTop: '20px', marginBottom: '10px', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: `${primaryColor}40` }} />
        <h2 style={{
          fontSize: `${fontSize.body - 0.5}px`,
          fontWeight: 700,
          color: primaryColor,
          textTransform: 'uppercase',
          letterSpacing: '2.5px',
          margin: 0,
          padding: '0 8px',
        }}>
          {children}
        </h2>
        <div style={{ flex: 1, height: '1px', backgroundColor: `${primaryColor}40` }} />
      </div>
    </div>
  );

  return (
    <div style={{
      fontFamily: config.fontFamily || 'Georgia, "Times New Roman", serif',
      fontSize: `${fontSize.body}px`,
      color: textColor,
      backgroundColor,
      maxWidth: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      border: `3px solid ${primaryColor}`,
      boxSizing: 'border-box',
    }}>
      <div style={{
        border: `1px solid ${primaryColor}30`,
        margin: '8px',
        padding: `${margins.top - 8}px ${margins.right - 8}px ${margins.bottom - 8}px ${margins.left - 8}px`,
        minHeight: 'calc(297mm - 16px)',
      }}>
        {/* Centered header */}
        <div style={{ textAlign: 'center', paddingBottom: '16px', marginBottom: '4px' }}>
          {contact.photoUrl && (
            <div style={{ marginBottom: '14px' }}>
              <PhotoCircle
                photoUrl={contact.photoUrl}
                name={contact.name || 'User'}
                size="medium"
                position="center"
                primaryColor={primaryColor}
              />
            </div>
          )}
          <h1 style={{
            fontSize: `${fontSize.header + 6}px`,
            fontWeight: 400,
            color: primaryColor,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            {contact.name || 'Your Name'}
          </h1>
          {experience && experience.length > 0 && (
            <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, fontStyle: 'italic', marginBottom: '10px' }}>
              {experience[0].title}
            </div>
          )}
          {/* Double rule */}
          <div style={{ marginBottom: '4px', height: '3px', backgroundColor: primaryColor }} />
          <div style={{ marginBottom: '10px', height: '1px', backgroundColor: primaryColor, opacity: 0.4 }} />
          <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, letterSpacing: '0.3px' }}>
            {[contact.email, contact.phone, contact.location, contact.linkedin, contact.github, contact.website]
              .filter(Boolean)
              .join('  ·  ')}
          </div>
        </div>

        {summary && (
          <>
            <SectionTitle>Profile</SectionTitle>
            <p style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.7, textAlign: 'center', fontStyle: 'italic' }}>{summary}</p>
          </>
        )}

        {experience && experience.length > 0 && (
          <>
            <SectionTitle>Professional Experience</SectionTitle>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>{exp.title}</span>
                  <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic' }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div style={{ fontSize: `${fontSize.body}px`, color: secondaryColor, marginBottom: '4px', fontStyle: 'italic' }}>
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                </div>
                {exp.description?.map((d, j) => (
                  <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.6, paddingLeft: '16px', marginBottom: '3px' }}>
                    ▸ {d}
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
              <div key={i} style={{ marginBottom: '10px', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>{edu.degree}</div>
                <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, fontStyle: 'italic' }}>
                  {edu.institution}{edu.graduationDate ? ` · ${edu.graduationDate}` : ''}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                </div>
              </div>
            ))}
          </>
        )}

        {skills && skills.length > 0 && (
          <>
            <SectionTitle>Core Competencies</SectionTitle>
            <div style={{ textAlign: 'center', fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 2 }}>
              {(skills as any[]).map(s => skillStr(s)).join('   ·   ')}
            </div>
          </>
        )}

        {certifications && certifications.length > 0 && (
          <>
            <SectionTitle>Certifications</SectionTitle>
            <div style={{ textAlign: 'center' }}>
              {(certifications as any[]).map((c, i) => (
                <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginBottom: '5px' }}>
                  {certStr(c)}
                </div>
              ))}
            </div>
          </>
        )}

        {projects && projects.length > 0 && (
          <>
            <SectionTitle>Notable Projects</SectionTitle>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor, textAlign: 'center' }}>
                  {p.name}{p.url ? ` — ${p.url}` : ''}
                </div>
                {p.description && (Array.isArray(p.description) && p.description.length > 1 ? (
                  <div style={{ margin: '4px 0' }}>
                    {p.description.map((d, di) => (
                      <div key={di} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.6, paddingLeft: '16px', marginBottom: '3px', fontStyle: 'italic' }}>▸ {d}</div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.6, textAlign: 'center', fontStyle: 'italic' }}>{Array.isArray(p.description) ? (p.description[0] || '') : p.description}</div>
                ))}
                {(p.technologies?.length ?? 0) > 0 && (
                  <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, textAlign: 'center' }}>Tech: {p.technologies!.join(', ')}</div>
                )}
              </div>
            ))}
          </>
        )}

        {languages && languages.length > 0 && (
          <>
            <SectionTitle>Languages</SectionTitle>
            <div style={{ textAlign: 'center', fontSize: `${fontSize.body}px`, color: mutedColor }}>
              {languages.join('   ·   ')}
            </div>
          </>
        )}

        {awards && awards.length > 0 && (
          <>
            <SectionTitle>Honors & Awards</SectionTitle>
            {(awards as any[]).map((a, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, textAlign: 'center', marginBottom: '4px' }}>
                {awardStr(a)}
              </div>
            ))}
          </>
        )}

        {volunteerWork && volunteerWork.length > 0 && (
          <>
            <SectionTitle>Community & Service</SectionTitle>
            {volunteerWork.map((v, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                {typeof v === 'string' ? (
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, textAlign: 'center' }}>{v}</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, color: textColor }}>{v.role}</span>
                      <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic' }}>
                        {v.startDate}{v.current ? ' – Present' : v.endDate ? ` – ${v.endDate}` : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, fontStyle: 'italic', marginBottom: '4px' }}>{v.organization}</div>
                    {v.description?.map((d: string, j: number) => (
                      <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, paddingLeft: '16px', marginBottom: '3px' }}>▸ {d}</div>
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
  id: 'BorderedPageLayout' as const,
  name: 'Bordered Page',
  description: 'Elegant double-border framing with centered serif name and decorative ruled section dividers',
  suitableFor: ['all'],
  complexity: 'moderate' as const,
  atsCompatibility: 'high' as const,
  isUnique: true,
};
