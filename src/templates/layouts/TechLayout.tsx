/**
 * TechLayout - Developer/tech-focused layout with prominent skills
 *
 * Structure: Skills-first approach, GitHub/portfolio emphasis, technical focus
 * Suitable for: Software engineers, developers, tech roles
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const TechLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, projects, certifications, languages, awards, volunteerWork } = data;
  const {
    primaryColor,
    secondaryColor,
    textColor,
    mutedColor,
    backgroundColor,
    accentColor,
    fontSize,
    margins,
  } = config;

  return (
    <div
      style={{
        fontFamily: "'Courier New', 'Consolas', monospace",
        fontSize: `${fontSize.body}px`,
        color: textColor,
        backgroundColor: backgroundColor,
        padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
        maxWidth: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
      }}
    >
      {/* Tech-style Header */}
      <div style={{
        borderBottom: `3px solid ${primaryColor}`,
        padding: '24px 30px',
        marginTop: `-${margins.top}px`,
        marginLeft: `-${margins.left}px`,
        marginRight: `-${margins.right}px`,
        marginBottom: '30px',
        fontFamily: "'Courier New', monospace",
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: `${fontSize.body - 2}px`, color: mutedColor, marginBottom: '4px' }}>
              $ whoami
            </div>
            <h1 style={{
              fontSize: `${fontSize.header}px`,
              margin: 0,
              fontWeight: 700,
              color: primaryColor,
              fontFamily: "'Courier New', monospace",
            }}>
              {contact.name || 'developer'}
            </h1>
            <div style={{
              fontSize: `${fontSize.body}px`,
              color: mutedColor,
              marginTop: '8px',
            }}>
              {contact.email && <span>{contact.email}</span>}
              {contact.github && <span> | {contact.github}</span>}
              {contact.website && <span> | {contact.website}</span>}
            </div>
          </div>
          {contact.photoUrl && (
            <PhotoCircle
              photoUrl={contact.photoUrl}
              name={contact.name || 'User'}
              size="medium"
              position="right"
              primaryColor={secondaryColor}
            />
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            fontSize: `${fontSize.body - 1}px`,
            color: mutedColor,
            marginBottom: '6px',
            fontFamily: "'Courier New', monospace",
          }}>
            {'// About'}
          </div>
          <p style={{
            fontSize: `${fontSize.body}px`,
            color: textColor,
            lineHeight: 1.7,
            margin: 0,
            fontFamily: 'Helvetica, Arial, sans-serif',
          }}>
            {summary}
          </p>
        </div>
      )}

      {/* Technical Skills - Prominent */}
      {skills && skills.length > 0 && (
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          border: `2px solid ${primaryColor}30`,
        }}>
          <div style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            fontFamily: "'Courier New', monospace",
          }}>
            {'> Technical Skills'}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '10px',
          }}>
            {skills.map((skill, index) => {
              const skillText = typeof skill === 'string' ? skill : (skill as any).category || (skill as any).name || String(skill);
              return (
                <div
                  key={index}
                  style={{
                    fontSize: `${fontSize.body}px`,
                    color: primaryColor,
                    border: `1px solid ${primaryColor}30`,
                    padding: '8px 12px',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {skillText}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            fontFamily: "'Courier New', monospace",
          }}>
            {'> Projects'}
          </div>
          {projects.map((project, index) => (
            <div key={index} style={{
              marginBottom: '20px',
              paddingLeft: '20px',
              borderLeft: `3px solid ${primaryColor}40`,
            }}>
              <h3 style={{
                fontSize: `${fontSize.subheader}px`,
                color: textColor,
                fontWeight: 700,
                margin: 0,
                marginBottom: '6px',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}>
                {project.name}
              </h3>
              {Array.isArray(project.description) && project.description.length > 1 ? (
                <ul style={{ margin: '4px 0', paddingLeft: '20px', listStyle: 'none' }}>
                  {project.description.map((d, i) => (
                    <li key={i} style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, marginBottom: '4px', fontFamily: 'Helvetica, Arial, sans-serif' }}>→ {d}</li>
                  ))}
                </ul>
              ) : (
                <p style={{
                  fontSize: `${fontSize.body}px`,
                  color: textColor,
                  lineHeight: 1.6,
                  margin: '0 0 8px 0',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}>
                  {Array.isArray(project.description) ? (project.description[0] || '') : project.description}
                </p>
              )}
              {project.technologies && (
                <div style={{
                  fontSize: `${fontSize.body - 1}px`,
                  color: mutedColor,
                  fontFamily: "'Courier New', monospace",
                }}>
                  Stack: {project.technologies.join(', ')}
                </div>
              )}
              {project.url && (
                <div style={{
                  fontSize: `${fontSize.body - 1}px`,
                  color: secondaryColor,
                  marginTop: '4px',
                  fontFamily: "'Courier New', monospace",
                }}>
                  URL: {project.url}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            fontFamily: "'Courier New', monospace",
          }}>
            {'> Work Experience'}
          </div>
          {experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{
                  fontSize: `${fontSize.subheader}px`,
                  color: textColor,
                  fontWeight: 700,
                  margin: 0,
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}>
                  {exp.title}
                </h3>
                <span style={{
                  fontSize: `${fontSize.body - 1}px`,
                  color: mutedColor,
                  whiteSpace: 'nowrap',
                  fontFamily: "'Courier New', monospace",
                }}>
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              <div style={{
                fontSize: `${fontSize.body}px`,
                color: secondaryColor,
                fontWeight: 600,
                marginTop: '4px',
                marginBottom: '8px',
              }}>
                {exp.company}
                {exp.location && ` @ ${exp.location}`}
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                {exp.description?.map((desc, i) => (
                  <li key={i} style={{
                    fontSize: `${fontSize.body}px`,
                    color: textColor,
                    lineHeight: 1.6,
                    marginBottom: '4px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                  }}>
                    → {desc}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education & Certifications */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
        {/* Education */}
        {education && education.length > 0 && (
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 700,
              marginBottom: '12px',
              fontFamily: "'Courier New', monospace",
            }}>
              {'> Education'}
            </div>
            {education.map((edu, index) => (
              <div key={index} style={{ marginBottom: '12px' }}>
                <h3 style={{
                  fontSize: `${fontSize.subheader - 1}px`,
                  color: textColor,
                  fontWeight: 700,
                  margin: 0,
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}>
                  {edu.degree}
                </h3>
                <div style={{
                  fontSize: `${fontSize.body}px`,
                  color: mutedColor,
                  marginTop: '2px',
                }}>
                  {edu.institution} • {edu.graduationDate}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 700,
              marginBottom: '12px',
              fontFamily: "'Courier New', monospace",
            }}>
              {'> Certifications'}
            </div>
            {certifications.map((cert, index) => (
              <div key={index} style={{
                fontSize: `${fontSize.body}px`,
                color: textColor,
                marginBottom: '8px',
              }}>
                ✓ {typeof cert === 'string' ? cert : cert.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Languages & Awards */}
      {((languages && languages.length > 0) || (awards && awards.length > 0)) && (
        <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
          {languages && languages.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: `${fontSize.subheader}px`,
                color: primaryColor,
                fontWeight: 700,
                marginBottom: '12px',
                fontFamily: "'Courier New', monospace",
              }}>
                {'> Languages'}
              </div>
              {languages.map((lang, index) => (
                <div key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginBottom: '6px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                  ✓ {lang}
                </div>
              ))}
            </div>
          )}
          {awards && awards.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: `${fontSize.subheader}px`,
                color: primaryColor,
                fontWeight: 700,
                marginBottom: '12px',
                fontFamily: "'Courier New', monospace",
              }}>
                {'> Awards'}
              </div>
              {awards.map((award, index) => (
                <div key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginBottom: '8px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                  ★ {typeof award === 'string' ? award : award.name}
                  {typeof award === 'object' && award.date && (
                    <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, marginLeft: '8px', fontFamily: "'Courier New', monospace" }}>
                      [{award.date}]
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Volunteer Work */}
      {volunteerWork && volunteerWork.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            fontFamily: "'Courier New', monospace",
          }}>
            {'> Volunteer Work'}
          </div>
          {volunteerWork.map((vol, index) => (
            <div key={index} style={{ marginBottom: '16px', paddingLeft: '20px', borderLeft: `3px solid ${primaryColor}40` }}>
              {typeof vol === 'string' ? (
                <div style={{ fontSize: `${fontSize.body}px`, color: textColor, fontFamily: 'Helvetica, Arial, sans-serif' }}>→ {vol}</div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ fontSize: `${fontSize.subheader}px`, color: textColor, fontWeight: 700, margin: 0, fontFamily: 'Helvetica, Arial, sans-serif' }}>
                      {vol.role}
                    </h3>
                    <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, whiteSpace: 'nowrap', fontFamily: "'Courier New', monospace" }}>
                      {vol.period || `${vol.startDate || ''}${vol.endDate ? ` - ${vol.endDate}` : vol.current ? ' - Present' : ''}`}
                    </span>
                  </div>
                  <div style={{ fontSize: `${fontSize.body}px`, color: secondaryColor, fontWeight: 600, marginTop: '4px', marginBottom: '8px' }}>
                    {vol.organization}{vol.location && ` @ ${vol.location}`}
                  </div>
                  {vol.description && vol.description.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                      {vol.description.map((desc, i) => (
                        <li key={i} style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, marginBottom: '4px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                          → {desc}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const metadata = {
  id: 'TechLayout' as const,
  name: 'Tech',
  description: 'Developer-focused layout with monospace fonts and prominent skills',
  suitableFor: ['tech-startup', 'engineering'],
  complexity: 'moderate' as const,
  atsCompatibility: 'medium' as const,
  isUnique: true,
};
