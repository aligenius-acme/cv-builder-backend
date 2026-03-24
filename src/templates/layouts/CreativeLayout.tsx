/**
 * CreativeLayout - Bold, artistic asymmetric design
 *
 * Structure: Full-height left color sidebar (38%) with contact/skills/education,
 *            right main content (62%) with name band header at top
 * Suitable for: Creative design, marketing, arts, UX/brand roles
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const CreativeLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, projects, certifications, languages, awards, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  const SideLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ marginBottom: '14px', marginTop: '22px' }}>
      <h3 style={{
        fontSize: `${fontSize.body}px`,
        fontWeight: 800,
        color: primaryColor,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        margin: 0,
        paddingBottom: '6px',
        borderBottom: `2px solid ${primaryColor}35`,
      }}>
        {children}
      </h3>
    </div>
  );

  const MainSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{
        fontSize: `${fontSize.subheader + 1}px`,
        fontWeight: 900,
        color: primaryColor,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        margin: '0 0 14px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{ width: '4px', height: '18px', borderLeft: `4px solid ${secondaryColor}`, display: 'inline-block', flexShrink: 0 }} />
        {title}
      </h2>
      {children}
    </div>
  );

  const skillText = (s: any) => typeof s === 'string' ? s : (s as any).category || (s as any).name || String(s);

  return (
    <div style={{
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: `${fontSize.body}px`,
      color: textColor,
      backgroundColor,
      maxWidth: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      display: 'flex',
    }}>
      {/* LEFT SIDEBAR */}
      <div style={{
        width: '38%',
        borderRight: `3px solid ${primaryColor}20`,
        padding: `${margins.top}px 22px ${margins.bottom}px 22px`,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Photo */}
        {contact.photoUrl && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <PhotoCircle
              photoUrl={contact.photoUrl}
              name={contact.name || 'User'}
              size="large"
              position="center"
              primaryColor={secondaryColor}
            />
          </div>
        )}

        {/* Name (in sidebar for creative layouts) */}
        <div style={{ marginBottom: '10px' }}>
          <h1 style={{
            fontSize: `${fontSize.header + 4}px`,
            fontWeight: 900,
            color: primaryColor,
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
          }}>
            {contact.name || 'Your Name'}
          </h1>
          {experience && experience[0]?.title && (
            <div style={{
              fontSize: `${fontSize.body}px`,
              color: mutedColor,
              marginTop: '8px',
              fontWeight: 500,
            }}>
              {experience[0].title}
            </div>
          )}
          <div style={{ height: '2px', backgroundColor: `${primaryColor}30`, marginTop: '14px', borderRadius: '2px' }} />
        </div>

        {/* Contact */}
        <SideLabel>Contact</SideLabel>
        <div style={{ fontSize: `${fontSize.body - 1}px`, lineHeight: 2, color: textColor }}>
          {contact.email && <div style={{ marginBottom: '4px', wordBreak: 'break-word' }}>{contact.email}</div>}
          {contact.phone && <div style={{ marginBottom: '4px' }}>{contact.phone}</div>}
          {contact.location && <div style={{ marginBottom: '4px' }}>{contact.location}</div>}
          {contact.linkedin && <div style={{ marginBottom: '4px', wordBreak: 'break-word' }}>{contact.linkedin}</div>}
          {contact.github && <div style={{ marginBottom: '4px', wordBreak: 'break-word' }}>{contact.github}</div>}
          {contact.website && <div style={{ marginBottom: '4px', wordBreak: 'break-word' }}>{contact.website}</div>}
        </div>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <>
            <SideLabel>Skills</SideLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {(skills as any[]).map((s, i) => (
                <div key={i} style={{
                  color: textColor,
                  border: `1px solid ${primaryColor}30`,
                  padding: '5px 12px',
                  borderRadius: '3px',
                  fontSize: `${fontSize.body - 1}px`,
                  fontWeight: 600,
                }}>
                  {skillText(s)}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <>
            <SideLabel>Education</SideLabel>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: `${fontSize.body - 1}px`, fontWeight: 700, color: textColor, lineHeight: 1.3 }}>{edu.degree}</div>
                <div style={{ fontSize: `${fontSize.body - 2}px`, color: mutedColor, marginTop: '3px' }}>
                  {edu.institution}{edu.graduationDate ? ` · ${edu.graduationDate}` : ''}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <>
            <SideLabel>Languages</SideLabel>
            {languages.map((lang, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body - 1}px`, color: textColor, marginBottom: '4px' }}>• {lang}</div>
            ))}
          </>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <>
            <SideLabel>Certifications</SideLabel>
            {(certifications as any[]).map((cert, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body - 2}px`, color: textColor, marginBottom: '6px', lineHeight: 1.4 }}>
                ◆ {typeof cert === 'string' ? cert : cert.name}
              </div>
            ))}
          </>
        )}

        {/* Awards */}
        {awards && awards.length > 0 && (
          <>
            <SideLabel>Awards</SideLabel>
            {(awards as any[]).map((award, i) => (
              <div key={i} style={{ fontSize: `${fontSize.body - 2}px`, color: textColor, marginBottom: '6px', lineHeight: 1.4 }}>
                ★ {typeof award === 'string' ? award : award.name}
              </div>
            ))}
          </>
        )}
      </div>

      {/* RIGHT MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: `${margins.top}px ${margins.right}px ${margins.bottom}px 30px`, flex: 1 }}>

          {/* Summary */}
          {summary && (
            <MainSection title="Profile">
              <p style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                {summary}
              </p>
            </MainSection>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <MainSection title="Experience">
              {experience.map((exp, index) => (
                <div key={index} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ fontSize: `${fontSize.subheader}px`, color: textColor, fontWeight: 700, margin: 0 }}>
                      {exp.title}
                    </h3>
                    <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, whiteSpace: 'nowrap' }}>
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 700, margin: '4px 0 8px' }}>
                    {exp.company}{exp.location && ` · ${exp.location}`}
                  </div>
                  {exp.description?.map((desc, i) => (
                    <div key={i} style={{
                      fontSize: `${fontSize.body}px`,
                      color: textColor,
                      lineHeight: 1.6,
                      margin: '0 0 5px 0',
                      paddingLeft: '14px',
                      borderLeft: `2px solid ${secondaryColor}60`,
                    }}>
                      {desc}
                    </div>
                  ))}
                </div>
              ))}
            </MainSection>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <MainSection title="Projects">
              {projects.map((project, index) => (
                <div key={index} style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: `${fontSize.subheader}px`, color: textColor, fontWeight: 700, margin: '0 0 6px 0' }}>
                    {project.name}
                    {project.url && <span style={{ fontSize: `${fontSize.body - 1}px`, fontWeight: 400, color: primaryColor, marginLeft: '8px' }}>{project.url}</span>}
                  </h3>
                  {Array.isArray(project.description) && project.description.length > 1 ? (
                    <ul style={{ margin: '4px 0', paddingLeft: '18px', listStyleType: 'disc' }}>
                      {project.description.map((d, i) => (
                        <li key={i} style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, marginBottom: '2px' }}>{d}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, margin: '0 0 6px 0' }}>
                      {Array.isArray(project.description) ? (project.description[0] || '') : project.description}
                    </p>
                  )}
                  {project.technologies && (
                    <div style={{ fontSize: `${fontSize.body - 1}px`, color: secondaryColor, fontWeight: 700 }}>
                      {project.technologies.join(' · ')}
                    </div>
                  )}
                </div>
              ))}
            </MainSection>
          )}

          {/* Volunteer */}
          {volunteerWork && volunteerWork.length > 0 && (
            <MainSection title="Volunteer Work">
              {volunteerWork.map((vol, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  {typeof vol === 'string' ? (
                    <div style={{ fontSize: `${fontSize.body}px`, color: textColor }}>• {vol}</div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700 }}>{vol.role}</span>
                        <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>
                          {vol.startDate}{vol.current ? ' – Present' : vol.endDate ? ` – ${vol.endDate}` : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: `${fontSize.body}px`, color: primaryColor, fontWeight: 600 }}>
                        {vol.organization}{vol.location && ` · ${vol.location}`}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </MainSection>
          )}
        </div>
      </div>
    </div>
  );
};

export const metadata = {
  id: 'CreativeLayout' as const,
  name: 'Creative',
  description: 'Full-height color sidebar with white text, accent-bar section headers for visual impact',
  suitableFor: ['creative-design', 'sales-marketing', 'tech-startup'],
  complexity: 'complex' as const,
  atsCompatibility: 'low' as const,
  isUnique: true,
};
