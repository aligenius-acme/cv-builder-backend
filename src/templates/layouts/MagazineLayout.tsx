/**
 * MagazineLayout - Editorial magazine-style with oversized name banner
 *
 * Structure: Full-width primaryColor banner with huge name, contact bar,
 *            two-column body: left 62% (experience, projects), right 34% (summary, skills, education)
 * Suitable for: Executive leadership, creative design
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const MagazineLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const skillStr = (s: any) => typeof s === 'string' ? s : s.category || s.name || String(s);
  const certStr = (c: any) => typeof c === 'string' ? c : c.name || '';
  const awardStr = (a: any) => typeof a === 'string' ? a : (a.name || '') + (a.date ? ` (${a.date})` : '');

  const LeftSectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ marginTop: '20px', marginBottom: '12px', borderBottom: `3px solid ${primaryColor}`, paddingBottom: '4px' }}>
      <h2 style={{
        fontSize: `${fontSize.subheader + 1}px`,
        fontWeight: 900,
        color: textColor,
        textTransform: 'uppercase',
        letterSpacing: '3px',
        margin: 0,
      }}>
        {children}
      </h2>
    </div>
  );

  const RightSectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ marginTop: '18px', marginBottom: '8px', borderBottom: `1px solid ${primaryColor}30`, paddingBottom: '3px' }}>
      <h2 style={{
        fontSize: `${fontSize.body}px`,
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
      {/* Top banner */}
      <div style={{
        backgroundColor: primaryColor,
        padding: `28px ${margins.left}px 20px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{
            fontSize: `${fontSize.header + 28}px`,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-2px',
            lineHeight: 1.0,
            margin: 0,
            marginBottom: '6px',
          }}>
            {contact.name || 'Your Name'}
          </h1>
          {experience && experience[0]?.title && (
            <div style={{ fontSize: `${fontSize.body + 2}px`, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>
              {experience[0].title}
            </div>
          )}
        </div>
        {contact.photoUrl && (
          <div style={{ flexShrink: 0, marginRight: `${margins.right - margins.left}px` }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.6)',
              backgroundImage: `url('${contact.photoUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }} />
          </div>
        )}
      </div>

      {/* Contact bar */}
      <div style={{
        backgroundColor: `${secondaryColor}15`,
        padding: `8px ${margins.left}px`,
        fontSize: `${fontSize.body - 1}px`,
        color: mutedColor,
        borderBottom: `1px solid ${primaryColor}20`,
      }}>
        {contactItems.join('  ·  ')}
      </div>

      {/* Two-column body */}
      <div style={{ display: 'flex', gap: '0', padding: `0 ${margins.right}px ${margins.bottom}px ${margins.left}px` }}>

        {/* Left column — 62% */}
        <div style={{ flex: '0 0 62%', paddingRight: '24px', borderRight: `1px solid ${primaryColor}15` }}>

          {experience && experience.length > 0 && (
            <>
              <LeftSectionTitle>Experience</LeftSectionTitle>
              {experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 800, fontSize: `${fontSize.subheader}px`, color: textColor }}>{exp.title}</span>
                    <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
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

          {projects && projects.length > 0 && (
            <>
              <LeftSectionTitle>Projects</LeftSectionTitle>
              {projects.map((p, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 800, fontSize: `${fontSize.subheader - 1}px`, color: textColor }}>
                    {p.name}{p.url ? <span style={{ fontWeight: 400, color: primaryColor, fontSize: `${fontSize.body - 1}px`, marginLeft: '8px' }}>{p.url}</span> : ''}
                  </div>
                  {p.description && <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.6 }}>{p.description}</div>}
                  {(p.technologies?.length ?? 0) > 0 && (
                    <div style={{ fontSize: `${fontSize.body - 1}px`, color: primaryColor, fontWeight: 600, marginTop: '2px' }}>{p.technologies!.join(' · ')}</div>
                  )}
                </div>
              ))}
            </>
          )}

          {volunteerWork && volunteerWork.length > 0 && (
            <>
              <LeftSectionTitle>Volunteer</LeftSectionTitle>
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
                        <div key={j} style={{ fontSize: `${fontSize.body}px`, color: mutedColor, paddingLeft: '14px' }}>• {d}</div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Right column — 34% */}
        <div style={{ flex: '0 0 34%', paddingLeft: '20px' }}>

          {summary && (
            <>
              <RightSectionTitle>Profile</RightSectionTitle>
              <p style={{ fontSize: `${fontSize.body}px`, color: mutedColor, lineHeight: 1.65, margin: 0 }}>{summary}</p>
            </>
          )}

          {skills && skills.length > 0 && (
            <>
              <RightSectionTitle>Skills</RightSectionTitle>
              <div style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.9 }}>
                {(skills as any[]).map(s => skillStr(s)).join(', ')}
              </div>
            </>
          )}

          {education && education.length > 0 && (
            <>
              <RightSectionTitle>Education</RightSectionTitle>
              {education.map((edu, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: `${fontSize.body}px`, color: textColor }}>{edu.degree}</div>
                  <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>
                    {edu.institution}{edu.graduationDate ? ` · ${edu.graduationDate}` : ''}{edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                  </div>
                </div>
              ))}
            </>
          )}

          {certifications && certifications.length > 0 && (
            <>
              <RightSectionTitle>Certifications</RightSectionTitle>
              {(certifications as any[]).map((c, i) => (
                <div key={i} style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, marginBottom: '5px', lineHeight: 1.4 }}>
                  • {certStr(c)}
                </div>
              ))}
            </>
          )}

          {languages && languages.length > 0 && (
            <>
              <RightSectionTitle>Languages</RightSectionTitle>
              <div style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.9 }}>
                {languages.join(', ')}
              </div>
            </>
          )}

          {awards && awards.length > 0 && (
            <>
              <RightSectionTitle>Awards</RightSectionTitle>
              {(awards as any[]).map((a, i) => (
                <div key={i} style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, marginBottom: '4px', lineHeight: 1.4 }}>
                  • {awardStr(a)}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const metadata = {
  id: 'MagazineLayout' as const,
  name: 'Magazine',
  description: 'Editorial magazine style with oversized banner name, contact bar, and two-column body for senior professionals',
  suitableFor: ['executive-leadership', 'creative-design'],
  complexity: 'complex' as const,
  atsCompatibility: 'medium' as const,
  isUnique: true,
};
