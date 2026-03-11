/**
 * ColumnSplitLayout - Full-width header, two-column body
 *
 * Structure: Full-width colored header, then body splits into
 *            Left 58% main content (experience, education, projects),
 *            Right 42% sidebar (summary, skills, certs, languages, awards)
 * Suitable for: All categories
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const ColumnSplitLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const skillStr = (s: any) => typeof s === 'string' ? s : s.category || s.name || String(s);
  const certStr = (c: any) => typeof c === 'string' ? c : c.name || '';
  const awardStr = (a: any) => typeof a === 'string' ? a : (a.name || '') + (a.date ? ` (${a.date})` : '');

  const MainSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ marginTop: '18px' }}>
      <h2 style={{
        fontSize: `${fontSize.body}px`,
        fontWeight: 700,
        color: primaryColor,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        paddingBottom: '5px',
        borderBottom: `2px solid ${primaryColor}`,
        marginBottom: '10px',
      }}>
        {title}
      </h2>
      {children}
    </div>
  );

  const SideSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ marginTop: '18px' }}>
      <h2 style={{
        fontSize: `${fontSize.body - 0.5}px`,
        fontWeight: 700,
        color: primaryColor,
        textTransform: 'uppercase',
        letterSpacing: '1.2px',
        paddingBottom: '4px',
        borderBottom: `1px solid ${primaryColor}40`,
        marginBottom: '8px',
      }}>
        {title}
      </h2>
      {children}
    </div>
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
        backgroundColor: primaryColor,
        padding: `24px ${margins.right}px 20px ${margins.left}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        <div style={{ flex: 1 }}>
        <h1 style={{
          fontSize: `${fontSize.header + 2}px`,
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-0.3px',
          marginBottom: '6px',
        }}>
          {contact.name || 'Your Name'}
        </h1>
        {experience && experience.length > 0 && (
          <div style={{ fontSize: `${fontSize.body}px`, color: 'rgba(255,255,255,0.8)', marginBottom: '10px' }}>
            {experience[0].title}{experience[0].company ? ` · ${experience[0].company}` : ''}
          </div>
        )}
        <div style={{ fontSize: `${fontSize.body - 1}px`, color: 'rgba(255,255,255,0.7)', display: 'flex', flexWrap: 'wrap', gap: '0 16px' }}>
          {[contact.email, contact.phone, contact.location, contact.linkedin, contact.github, contact.website]
            .filter(Boolean)
            .map((v, i) => <span key={i}>{v}</span>)}
        </div>
        </div>
        {contact.photoUrl && (
          <div style={{ flexShrink: 0 }}>
            <PhotoCircle
              photoUrl={contact.photoUrl}
              name={contact.name || 'User'}
              size="medium"
              position="center"
              primaryColor={primaryColor}
            />
          </div>
        )}
      </div>

      {/* Two-column body */}
      <div style={{ display: 'flex', gap: '0', padding: `0 ${margins.right}px ${margins.bottom}px ${margins.left}px` }}>
        {/* Left main — 58% */}
        <div style={{ flex: '0 0 58%', paddingRight: '24px', borderRight: `1px solid ${primaryColor}20` }}>
          {experience && experience.length > 0 && (
            <MainSection title="Experience">
              {experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>{exp.title}</span>
                    <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic' }}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div style={{ fontSize: `${fontSize.body}px`, color: secondaryColor, marginBottom: '4px', fontWeight: 500 }}>
                    {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                  </div>
                  {exp.description?.map((d, j) => (
                    <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.55, paddingLeft: '12px', marginBottom: '3px' }}>
                      • {d}
                    </div>
                  ))}
                </div>
              ))}
            </MainSection>
          )}

          {education && education.length > 0 && (
            <MainSection title="Education">
              {education.map((edu, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>{edu.degree}</div>
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>
                    {edu.institution}{edu.graduationDate ? ` · ${edu.graduationDate}` : ''}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                  </div>
                </div>
              ))}
            </MainSection>
          )}

          {projects && projects.length > 0 && (
            <MainSection title="Projects">
              {projects.map((p, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>
                    {p.name}{p.url ? ` — ${p.url}` : ''}
                  </div>
                  {p.description && <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.6 }}>{p.description}</div>}
                  {(p.technologies?.length ?? 0) > 0 && (
                    <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>Tech: {p.technologies!.join(', ')}</div>
                  )}
                </div>
              ))}
            </MainSection>
          )}

          {volunteerWork && volunteerWork.length > 0 && (
            <MainSection title="Volunteer Work">
              {volunteerWork.map((v, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  {typeof v === 'string' ? (
                    <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, paddingLeft: '12px' }}>• {v}</div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 700, color: textColor }}>{v.role}</span>
                        <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic' }}>
                          {v.startDate}{v.current ? ' – Present' : v.endDate ? ` – ${v.endDate}` : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginBottom: '4px' }}>{v.organization}</div>
                      {v.description?.map((d: string, j: number) => (
                        <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, paddingLeft: '12px', marginBottom: '3px' }}>• {d}</div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </MainSection>
          )}
        </div>

        {/* Right sidebar — 42% */}
        <div style={{ flex: '0 0 42%', paddingLeft: '20px' }}>
          {summary && (
            <SideSection title="Summary">
              <p style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.65 }}>{summary}</p>
            </SideSection>
          )}

          {skills && skills.length > 0 && (
            <SideSection title="Skills">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {(skills as any[]).map((s, i) => (
                  <span key={i} style={{
                    backgroundColor: `${primaryColor}12`,
                    color: primaryColor,
                    border: `1px solid ${primaryColor}30`,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: `${fontSize.body - 1}px`,
                    fontWeight: 600,
                  }}>
                    {skillStr(s)}
                  </span>
                ))}
              </div>
            </SideSection>
          )}

          {certifications && certifications.length > 0 && (
            <SideSection title="Certifications">
              {(certifications as any[]).map((c, i) => (
                <div key={i} style={{ fontSize: `${fontSize.body - 0.5}px`, color: mutedColor, marginBottom: '5px', lineHeight: 1.4 }}>
                  • {certStr(c)}
                </div>
              ))}
            </SideSection>
          )}

          {languages && languages.length > 0 && (
            <SideSection title="Languages">
              {languages.map((l, i) => (
                <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginBottom: '4px' }}>• {l}</div>
              ))}
            </SideSection>
          )}

          {awards && awards.length > 0 && (
            <SideSection title="Awards">
              {(awards as any[]).map((a, i) => (
                <div key={i} style={{ fontSize: `${fontSize.body - 0.5}px`, color: mutedColor, marginBottom: '5px', lineHeight: 1.4 }}>
                  • {awardStr(a)}
                </div>
              ))}
            </SideSection>
          )}
        </div>
      </div>
    </div>
  );
};

export const metadata = {
  id: 'ColumnSplitLayout' as const,
  name: 'Column Split',
  description: 'Full-width colored header with two-column body — main content left, skills and summary right',
  suitableFor: ['all'],
  complexity: 'moderate' as const,
  atsCompatibility: 'medium' as const,
  isUnique: true,
};
