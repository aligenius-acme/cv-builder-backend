/**
 * TwoColumnSidebarLayout - Professional two-column layout with left sidebar
 *
 * Structure: 32% sidebar (colored bg, photo, contact, skills) | 68% main content
 * Suitable for: All categories, modern professional look
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const TwoColumnSidebarLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const { primaryColor, secondaryColor, textColor, mutedColor, backgroundColor, fontSize, margins } = config;

  // Sidebar uses a light tinted background derived from primary
  const sidebarBg = `${primaryColor}12`;

  const SideSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{
        fontSize: `${fontSize.body}px`,
        color: primaryColor,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        margin: '0 0 8px 0',
        paddingBottom: '5px',
        borderBottom: `2px solid ${primaryColor}`,
      }}>
        {title}
      </h3>
      {children}
    </div>
  );

  const MainSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ marginBottom: '22px' }}>
      <h2 style={{
        fontSize: `${fontSize.subheader}px`,
        color: primaryColor,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        margin: '0 0 12px 0',
        paddingBottom: '6px',
        borderBottom: `2px solid ${primaryColor}`,
      }}>
        {title}
      </h2>
      {children}
    </div>
  );

  const skillText = (s: any) => typeof s === 'string' ? s : (s as any).category || (s as any).name || String(s);

  return (
    <div style={{
      fontFamily: config.fontFamily || 'Helvetica, Arial, sans-serif',
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
        width: '32%',
        padding: `${margins.top}px 18px ${margins.bottom}px 18px`,
        borderRight: `3px solid ${primaryColor}20`,
      }}>

        {/* Photo */}
        {contact.photoUrl && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <PhotoCircle
              photoUrl={contact.photoUrl}
              name={contact.name || 'User'}
              size="large"
              position="center"
              primaryColor={primaryColor}
            />
          </div>
        )}

        {/* Name block in sidebar */}
        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `2px solid ${primaryColor}25` }}>
          <h1 style={{
            fontSize: `${fontSize.header - 2}px`,
            color: primaryColor,
            margin: 0,
            fontWeight: 700,
            lineHeight: 1.2,
          }}>
            {contact.name || 'Your Name'}
          </h1>
          {experience && experience[0]?.title && (
            <div style={{ fontSize: `${fontSize.body - 1}px`, color: secondaryColor, fontWeight: 600, marginTop: '5px' }}>
              {experience[0].title}
            </div>
          )}
        </div>

        {/* Contact */}
        <SideSection title="Contact">
          <div style={{ fontSize: `${fontSize.body - 1}px`, lineHeight: 1.9, color: textColor }}>
            {contact.email && <div style={{ marginBottom: '4px', wordBreak: 'break-word' }}>{contact.email}</div>}
            {contact.phone && <div style={{ marginBottom: '4px' }}>{contact.phone}</div>}
            {contact.location && <div style={{ marginBottom: '4px' }}>{contact.location}</div>}
            {contact.linkedin && <div style={{ marginBottom: '4px', wordBreak: 'break-word' }}>{contact.linkedin}</div>}
            {contact.github && <div style={{ marginBottom: '4px', wordBreak: 'break-word' }}>{contact.github}</div>}
            {contact.website && <div style={{ marginBottom: '4px', wordBreak: 'break-word' }}>{contact.website}</div>}
          </div>
        </SideSection>

        {/* Skills — pills */}
        {skills && skills.length > 0 && (
          <SideSection title="Skills">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {(skills as any[]).map((skill, index) => (
                <span key={index} style={{
                  fontSize: `${fontSize.body - 2}px`,
                  color: primaryColor,
                  border: `1px solid ${primaryColor}35`,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontWeight: 600,
                }}>
                  {skillText(skill)}
                </span>
              ))}
            </div>
          </SideSection>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <SideSection title="Languages">
            <div style={{ fontSize: `${fontSize.body - 1}px`, lineHeight: 1.8, color: textColor }}>
              {languages.map((lang, index) => (
                <div key={index} style={{ marginBottom: '4px' }}>• {lang}</div>
              ))}
            </div>
          </SideSection>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <SideSection title="Certifications">
            <div style={{ fontSize: `${fontSize.body - 2}px`, lineHeight: 1.6, color: textColor }}>
              {(certifications as any[]).map((cert, index) => (
                <div key={index} style={{ marginBottom: '7px' }}>
                  {typeof cert === 'string' ? cert : cert.name}
                  {typeof cert === 'object' && cert.date && (
                    <div style={{ color: mutedColor, fontSize: `${fontSize.body - 3}px` }}>{cert.date}</div>
                  )}
                </div>
              ))}
            </div>
          </SideSection>
        )}

        {/* Awards */}
        {awards && awards.length > 0 && (
          <SideSection title="Awards">
            <div style={{ fontSize: `${fontSize.body - 1}px`, lineHeight: 1.8, color: textColor }}>
              {(awards as any[]).map((award, index) => (
                <div key={index} style={{ marginBottom: '6px' }}>
                  • {typeof award === 'string' ? award : award.name}
                  {typeof award === 'object' && award.date && (
                    <div style={{ fontSize: `${fontSize.body - 3}px`, color: mutedColor }}>{award.date}</div>
                  )}
                </div>
              ))}
            </div>
          </SideSection>
        )}
      </div>

      {/* RIGHT MAIN CONTENT */}
      <div style={{ flex: 1, padding: `${margins.top}px ${margins.right}px ${margins.bottom}px 28px` }}>

        {/* Summary */}
        {summary && (
          <MainSection title="Professional Summary">
            <p style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.65, margin: 0 }}>
              {summary}
            </p>
          </MainSection>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <MainSection title="Experience">
            {experience.map((exp, index) => (
              <div key={index} style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ fontSize: `${fontSize.subheader}px`, color: textColor, fontWeight: 700, margin: 0 }}>
                    {exp.title}
                  </h3>
                  <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, whiteSpace: 'nowrap' }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div style={{ fontSize: `${fontSize.body}px`, color: secondaryColor, fontWeight: 600, margin: '3px 0 8px' }}>
                  {exp.company}{exp.location && ` · ${exp.location}`}
                </div>
                <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
                  {exp.description?.map((desc, i) => (
                    <li key={i} style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, marginBottom: '4px', paddingLeft: '14px', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: primaryColor, fontWeight: 700 }}>•</span>
                      {desc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </MainSection>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <MainSection title="Education">
            {education.map((edu, index) => (
              <div key={index} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ fontSize: `${fontSize.subheader}px`, color: textColor, fontWeight: 700, margin: 0 }}>
                    {edu.degree}
                  </h3>
                  <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>
                    {edu.graduationDate}
                  </span>
                </div>
                <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginTop: '3px' }}>
                  {edu.institution}{edu.location && ` · ${edu.location}`}{edu.gpa && ` · GPA: ${edu.gpa}`}
                </div>
              </div>
            ))}
          </MainSection>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <MainSection title="Projects">
            {projects.map((project, index) => (
              <div key={index} style={{ marginBottom: '14px' }}>
                <h3 style={{ fontSize: `${fontSize.subheader}px`, color: textColor, fontWeight: 700, margin: 0 }}>
                  {project.name}
                  {project.url && (
                    <span style={{ fontSize: `${fontSize.body - 1}px`, color: primaryColor, fontWeight: 400, marginLeft: '8px' }}>
                      {project.url}
                    </span>
                  )}
                </h3>
                {Array.isArray(project.description) && project.description.length > 1 ? (
                  <ul style={{ margin: '4px 0', paddingLeft: '0', listStyle: 'none' }}>
                    {project.description.map((d, i) => (
                      <li key={i} style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, marginBottom: '4px', paddingLeft: '14px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: primaryColor, fontWeight: 700 }}>•</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, margin: '4px 0' }}>
                    {Array.isArray(project.description) ? (project.description[0] || '') : project.description}
                  </p>
                )}
                {project.technologies && (
                  <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, marginTop: '3px' }}>
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
            {volunteerWork.map((vol, index) => (
              <div key={index} style={{ marginBottom: '14px' }}>
                {typeof vol === 'string' ? (
                  <div style={{ fontSize: `${fontSize.body}px`, color: textColor }}>• {vol}</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <h3 style={{ fontSize: `${fontSize.subheader}px`, color: textColor, fontWeight: 700, margin: 0 }}>
                        {vol.role}
                      </h3>
                      <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, whiteSpace: 'nowrap' }}>
                        {vol.period || `${vol.startDate || ''}${vol.current ? ' – Present' : vol.endDate ? ` – ${vol.endDate}` : ''}`}
                      </span>
                    </div>
                    <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginTop: '3px', marginBottom: '6px' }}>
                      {vol.organization}{vol.location && ` · ${vol.location}`}
                    </div>
                    {vol.description && vol.description.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
                        {vol.description.map((desc, i) => (
                          <li key={i} style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, marginBottom: '4px', paddingLeft: '14px', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0, color: primaryColor, fontWeight: 700 }}>•</span>
                            {desc}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            ))}
          </MainSection>
        )}
      </div>
    </div>
  );
};

export const metadata = {
  id: 'TwoColumnSidebarLayout' as const,
  name: 'Two Column Sidebar',
  description: 'Professional two-column layout with tinted sidebar for contact, skills, and credentials',
  suitableFor: ['all'],
  complexity: 'moderate' as const,
  atsCompatibility: 'medium' as const,
  isUnique: true,
};
