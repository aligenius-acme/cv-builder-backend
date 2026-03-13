/**
 * MonogramLayout - Executive layout with large typographic initials
 *
 * Structure: Large initial letters block in header, thin name with font-weight 300,
 *            drop-initial section titles, dot-separated inline skills
 * Suitable for: Executive leadership, ATS-professional
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const MonogramLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const skillStr = (s: any) => typeof s === 'string' ? s : s.category || s.name || String(s);
  const certStr = (c: any) => typeof c === 'string' ? c : c.name || '';
  const awardStr = (a: any) => typeof a === 'string' ? a : (a.name || '') + (a.date ? ` (${a.date})` : '');

  // Get initials from name
  const getInitials = (name: string): string => {
    const parts = (name || 'YN').trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (parts[0][0] || 'Y').toUpperCase();
  };

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const text = String(children);
    const firstLetter = text.charAt(0);
    const rest = text.slice(1).toUpperCase();
    return (
      <div style={{ display: 'flex', alignItems: 'baseline', margin: '22px 0 10px' }}>
        <span style={{
          fontSize: '18px',
          fontWeight: 700,
          color: primaryColor,
          lineHeight: 1,
        }}>
          {firstLetter.toUpperCase()}
        </span>
        <span style={{
          fontSize: `${fontSize.subheader - 1}px`,
          fontWeight: 700,
          color: textColor,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          marginLeft: '1px',
        }}>
          {rest}
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: `${primaryColor}25`, marginLeft: '10px' }} />
      </div>
    );
  };

  const contactItems = [contact.email, contact.phone, contact.location, contact.linkedin, contact.github, contact.website].filter(Boolean);
  const initials = getInitials(contact.name || 'Your Name');

  return (
    <div style={{
      fontFamily: config.fontFamily || '"Georgia", "Times New Roman", serif',
      fontSize: `${fontSize.body}px`,
      color: textColor,
      backgroundColor,
      maxWidth: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        padding: `${margins.top + 8}px ${margins.left}px 16px`,
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
      }}>
        {/* Monogram block or photo */}
        {contact.photoUrl ? (
          <PhotoCircle
            photoUrl={contact.photoUrl}
            name={contact.name || 'User'}
            size="small"
            position="left"
            primaryColor={primaryColor}
          />
        ) : (
          <div style={{
            width: '96px',
            height: '96px',
            border: `3px solid ${primaryColor}`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: '80px',
              fontWeight: 900,
              color: primaryColor,
              lineHeight: 1,
              fontFamily: '"Arial", sans-serif',
            }}>
              {initials}
            </span>
          </div>
        )}
        {/* Name and contact */}
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: `${fontSize.header + 4}px`,
            fontWeight: 300,
            color: textColor,
            letterSpacing: '1px',
            margin: 0,
            marginBottom: '4px',
          }}>
            {contact.name || 'Your Name'}
          </h1>
          {experience && experience[0]?.title && (
            <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginBottom: '8px', fontStyle: 'italic' }}>
              {experience[0].title}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {contactItems.map((item, i) => (
              <span key={i} style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Thin rule */}
      <div style={{ margin: `0 ${margins.left}px`, height: '2px', backgroundColor: `${primaryColor}30` }} />

      {/* Body */}
      <div style={{ padding: `8px ${margins.right}px ${margins.bottom}px ${margins.left}px` }}>

        {summary && (
          <>
            <SectionTitle>Profile</SectionTitle>
            <p style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.7, margin: 0 }}>{summary}</p>
          </>
        )}

        {experience && experience.length > 0 && (
          <>
            <SectionTitle>Experience</SectionTitle>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>{exp.title}</span>
                  <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic' }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600, marginBottom: '5px' }}>
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                </div>
                {exp.description?.map((d, j) => (
                  <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.6, paddingLeft: '14px', marginBottom: '3px' }}>
                    — {d}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {skills && skills.length > 0 && (
          <>
            <SectionTitle>Competencies</SectionTitle>
            <div style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 2 }}>
              {(skills as any[]).map(s => skillStr(s)).join('  ·  ')}
            </div>
          </>
        )}

        {education && education.length > 0 && (
          <>
            <SectionTitle>Education</SectionTitle>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 700, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>{edu.degree}</div>
                <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, fontStyle: 'italic' }}>
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
            <SectionTitle>Certifications</SectionTitle>
            <div style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 2 }}>
              {(certifications as any[]).map(c => certStr(c)).join('  ·  ')}
            </div>
          </>
        )}

        {languages && languages.length > 0 && (
          <>
            <SectionTitle>Languages</SectionTitle>
            <div style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 2 }}>
              {languages.join('  ·  ')}
            </div>
          </>
        )}

        {awards && awards.length > 0 && (
          <>
            <SectionTitle>Awards</SectionTitle>
            {(awards as any[]).map((a, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginBottom: '4px' }}>
                — {awardStr(a)}
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
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor }}>— {v}</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, color: textColor }}>{v.role}</span>
                      <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, fontStyle: 'italic' }}>{v.startDate}{v.current ? ' – Present' : v.endDate ? ` – ${v.endDate}` : ''}</span>
                    </div>
                    <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor }}>{v.organization}</div>
                    {v.description?.map((d: string, j: number) => (
                      <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, paddingLeft: '14px' }}>— {d}</div>
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
  id: 'MonogramLayout' as const,
  name: 'Monogram',
  description: 'Executive layout with large typographic initials block, elegant thin-weight name, and drop-initial section titles',
  suitableFor: ['executive-leadership', 'ats-professional'],
  complexity: 'moderate' as const,
  atsCompatibility: 'high' as const,
  isUnique: true,
};
