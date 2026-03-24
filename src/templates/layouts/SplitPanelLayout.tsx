/**
 * SplitPanelLayout - Left colored panel / right white body
 *
 * Structure: Left 33% primaryColor sidebar (name, contact, skills, certifications, languages),
 *            Right 67% white body (summary, experience, education, projects, awards)
 * Suitable for: All categories
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const SplitPanelLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const skillStr = (s: any) => typeof s === 'string' ? s : s.category || s.name || String(s);
  const certStr = (c: any) => typeof c === 'string' ? c : c.name || '';
  const awardStr = (a: any) => typeof a === 'string' ? a : (a.name || '') + (a.date ? ` (${a.date})` : '');

  const SidebarSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ marginTop: '22px' }}>
      <h2 style={{
        fontSize: `${fontSize.body}px`,
        fontWeight: 700,
        color: '#ffffff',
        textTransform: 'uppercase',
        letterSpacing: '1.2px',
        paddingBottom: '6px',
        borderBottom: '1px solid rgba(255,255,255,0.3)',
        marginBottom: '10px',
      }}>
        {title}
      </h2>
      {children}
    </div>
  );

  const BodySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ marginTop: '18px' }}>
      <h2 style={{
        fontSize: `${fontSize.subheader}px`,
        fontWeight: 700,
        color: primaryColor,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '8px',
        paddingBottom: '4px',
        borderBottom: `2px solid ${primaryColor}`,
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
      display: 'flex',
    }}>
      {/* Left sidebar */}
      <div style={{
        width: '33%',
        backgroundColor: primaryColor,
        padding: `${margins.top}px 20px ${margins.bottom}px 20px`,
        flexShrink: 0,
      }}>
        {/* Photo */}
        {contact.photoUrl && (
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <PhotoCircle
              photoUrl={contact.photoUrl}
              name={contact.name || 'User'}
              size="large"
              position="center"
              primaryColor={primaryColor}
            />
          </div>
        )}

        {/* Name */}
        <h1 style={{
          fontSize: `${fontSize.header}px`,
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1.15,
          marginBottom: '6px',
          letterSpacing: '-0.3px',
        }}>
          {contact.name || 'Your Name'}
        </h1>
        {experience && experience.length > 0 && (
          <div style={{ fontSize: `${fontSize.body - 1}px`, color: 'rgba(255,255,255,0.75)', marginBottom: '16px' }}>
            {experience[0].title}
          </div>
        )}

        {/* Contact */}
        <SidebarSection title="Contact">
          {[
            contact.email && { label: contact.email },
            contact.phone && { label: contact.phone },
            contact.location && { label: contact.location },
            contact.linkedin && { label: contact.linkedin },
            contact.github && { label: contact.github },
            contact.website && { label: contact.website },
          ].filter(Boolean).map((item: any, i) => (
            <div key={i} style={{ fontSize: `${fontSize.body - 1}px`, color: 'rgba(255,255,255,0.85)', marginBottom: '5px', wordBreak: 'break-word', lineHeight: 1.45 }}>
              {item.label}
            </div>
          ))}
        </SidebarSection>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <SidebarSection title="Skills">
            {(skills as any[]).map((s, i) => (
              <div key={i} style={{
                fontSize: `${fontSize.body - 1}px`,
                color: 'rgba(255,255,255,0.88)',
                marginBottom: '5px',
                paddingLeft: '8px',
                borderLeft: '2px solid rgba(255,255,255,0.4)',
              }}>
                {skillStr(s)}
              </div>
            ))}
          </SidebarSection>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <SidebarSection title="Certifications">
            {(certifications as any[]).map((c, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body - 1}px`, color: 'rgba(255,255,255,0.85)', marginBottom: '5px', lineHeight: 1.4 }}>
                • {certStr(c)}
              </div>
            ))}
          </SidebarSection>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <SidebarSection title="Languages">
            {languages.map((l, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body - 1}px`, color: 'rgba(255,255,255,0.85)', marginBottom: '4px' }}>
                • {l}
              </div>
            ))}
          </SidebarSection>
        )}
      </div>

      {/* Right body */}
      <div style={{
        flex: 1,
        padding: `${margins.top}px ${margins.right}px ${margins.bottom}px 24px`,
      }}>
        {summary && (
          <BodySection title="Profile">
            <p style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.65 }}>{summary}</p>
          </BodySection>
        )}

        {experience && experience.length > 0 && (
          <BodySection title="Experience">
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
                  <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.55, paddingLeft: '14px', marginBottom: '3px' }}>
                    • {d}
                  </div>
                ))}
              </div>
            ))}
          </BodySection>
        )}

        {education && education.length > 0 && (
          <BodySection title="Education">
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>{edu.degree}</div>
                <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>
                  {edu.institution}{edu.graduationDate ? ` · ${edu.graduationDate}` : ''}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                </div>
              </div>
            ))}
          </BodySection>
        )}

        {projects && projects.length > 0 && (
          <BodySection title="Projects">
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>
                  {p.name}{p.url ? ` — ${p.url}` : ''}
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
                  <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>Tech: {p.technologies!.join(', ')}</div>
                )}
              </div>
            ))}
          </BodySection>
        )}

        {awards && awards.length > 0 && (
          <BodySection title="Awards">
            {(awards as any[]).map((a, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, paddingLeft: '14px', marginBottom: '4px' }}>
                • {awardStr(a)}
              </div>
            ))}
          </BodySection>
        )}

        {volunteerWork && volunteerWork.length > 0 && (
          <BodySection title="Volunteer Work">
            {volunteerWork.map((v, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                {typeof v === 'string' ? (
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, paddingLeft: '14px' }}>• {v}</div>
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
                      <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, paddingLeft: '14px', marginBottom: '3px' }}>• {d}</div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </BodySection>
        )}
      </div>
    </div>
  );
};

export const metadata = {
  id: 'SplitPanelLayout' as const,
  name: 'Split Panel',
  description: 'Bold colored left panel with contact/skills, clean white right body for experience and education',
  suitableFor: ['all'],
  complexity: 'moderate' as const,
  atsCompatibility: 'medium' as const,
  isUnique: true,
};
