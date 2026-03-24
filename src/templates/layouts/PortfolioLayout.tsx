/**
 * PortfolioLayout - Project showcase focused layout
 *
 * Structure: Projects-first approach, visual portfolio emphasis
 * Suitable for: Designers, developers, creative professionals
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const PortfolioLayout: React.FC<LayoutProps> = ({ data, config }) => {
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
        fontFamily: config.fontFamily || 'Helvetica, Arial, sans-serif',
        fontSize: `${fontSize.body}px`,
        color: textColor,
        backgroundColor: backgroundColor,
        padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
        maxWidth: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
      }}
    >
      {/* Portfolio Header */}
      <div style={{
        display: 'flex',
        gap: '30px',
        marginBottom: '40px',
        paddingBottom: '30px',
        borderBottom: `3px solid ${primaryColor}`,
      }}>
        {contact.photoUrl && (
          <div>
            <PhotoCircle
              photoUrl={contact.photoUrl}
              name={contact.name || 'User'}
              size="large"
              position="left"
              primaryColor={primaryColor}
            />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: `${fontSize.header + 4}px`,
            color: primaryColor,
            margin: 0,
            fontWeight: 700,
            marginBottom: '12px',
          }}>
            {contact.name || 'Your Name'}
          </h1>
          {summary && (
            <p style={{
              fontSize: `${fontSize.body}px`,
              color: textColor,
              lineHeight: 1.6,
              margin: 0,
              marginBottom: '12px',
            }}>
              {summary}
            </p>
          )}
          <div style={{
            fontSize: `${fontSize.body}px`,
            color: mutedColor,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            {contact.email && <span>{contact.email}</span>}
            {contact.phone && <span>•</span>}
            {contact.phone && <span>{contact.phone}</span>}
            {contact.website && <span>•</span>}
            {contact.website && <span style={{ color: primaryColor }}>{contact.website}</span>}
          </div>
        </div>
      </div>

      {/* Featured Projects - Portfolio Style */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 3}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}>
            Featured Projects
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
          }}>
            {projects.map((project, index) => (
              <div
                key={index}
                style={{
                  padding: '20px',
                  border: `2px solid ${index % 2 === 0 ? primaryColor : secondaryColor}`,
                }}
              >
                <h3 style={{
                  fontSize: `${fontSize.subheader}px`,
                  color: textColor,
                  fontWeight: 700,
                  margin: 0,
                  marginBottom: '8px',
                }}>
                  {project.name}
                </h3>
                {Array.isArray(project.description) && project.description.length > 1 ? (
                  <div style={{ margin: '4px 0' }}>
                    {project.description.map((d, i) => (
                      <div key={i} style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, marginBottom: '8px' }}>• {d}</div>
                    ))}
                  </div>
                ) : (
                  <p style={{
                    fontSize: `${fontSize.body}px`,
                    color: textColor,
                    lineHeight: 1.6,
                    margin: '0 0 12px 0',
                  }}>
                    {Array.isArray(project.description) ? (project.description[0] || '') : project.description}
                  </p>
                )}
                {project.technologies && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginBottom: '8px',
                  }}>
                    {project.technologies.map((tech, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: `${fontSize.body - 2}px`,
                          color: index % 2 === 0 ? primaryColor : secondaryColor,
                          border: `1px solid ${index % 2 === 0 ? primaryColor : secondaryColor}50`,
                          padding: '3px 8px',
                          borderRadius: '3px',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {project.url && (
                  <div style={{
                    fontSize: `${fontSize.body - 1}px`,
                    color: primaryColor,
                    fontWeight: 600,
                  }}>
                    ↗ {project.url}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Grid */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 3}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}>
            Skills & Tools
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
          }}>
            {skills.map((skill, index) => {
              const skillText = typeof skill === 'string' ? skill : (skill as any).category || (skill as any).name || String(skill);
              return (
                <div
                  key={index}
                  style={{
                    fontSize: `${fontSize.body}px`,
                    color: textColor,
                    padding: '12px',
                    textAlign: 'center',
                    border: `1px solid ${primaryColor}30`,
                    fontWeight: 600,
                  }}
                >
                  {skillText}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Experience & Education - Condensed */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
        {/* Experience */}
        {experience && experience.length > 0 && (
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: `${fontSize.subheader + 2}px`,
              color: primaryColor,
              fontWeight: 700,
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Experience
            </h2>
            {experience.map((exp, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: `${fontSize.subheader - 1}px`, color: textColor, fontWeight: 700, margin: 0 }}>
                  {exp.title}
                </h3>
                <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginTop: '4px' }}>
                  {exp.company} • {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: `${fontSize.subheader + 2}px`,
              color: primaryColor,
              fontWeight: 700,
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Education
            </h2>
            {education.map((edu, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: `${fontSize.subheader - 1}px`, color: textColor, fontWeight: 700, margin: 0 }}>
                  {edu.degree}
                </h3>
                <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, marginTop: '4px' }}>
                  {edu.institution} • {edu.graduationDate}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certifications, Languages, Awards - Row */}
      {((certifications && certifications.length > 0) || (languages && languages.length > 0) || (awards && awards.length > 0)) && (
        <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
          {certifications && certifications.length > 0 && (
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: `${fontSize.subheader + 2}px`, color: primaryColor, fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Certifications
              </h2>
              {certifications.map((cert, index) => (
                <div key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginBottom: '8px' }}>
                  • {typeof cert === 'string' ? cert : cert.name}
                </div>
              ))}
            </div>
          )}
          {languages && languages.length > 0 && (
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: `${fontSize.subheader + 2}px`, color: primaryColor, fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Languages
              </h2>
              {languages.map((lang, index) => (
                <div key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginBottom: '8px' }}>• {lang}</div>
              ))}
            </div>
          )}
          {awards && awards.length > 0 && (
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: `${fontSize.subheader + 2}px`, color: primaryColor, fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Awards
              </h2>
              {awards.map((award, index) => (
                <div key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginBottom: '8px' }}>
                  • {typeof award === 'string' ? award : award.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Volunteer Work */}
      {volunteerWork && volunteerWork.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: `${fontSize.subheader + 2}px`, color: primaryColor, fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Volunteer Work
          </h2>
          {volunteerWork.map((vol, index) => (
            <div key={index} style={{ marginBottom: '12px' }}>
              {typeof vol === 'string' ? (
                <div style={{ fontSize: `${fontSize.body}px`, color: textColor }}>• {vol}</div>
              ) : (
                <div style={{ fontSize: `${fontSize.body}px`, color: textColor }}>
                  <strong>{vol.role}</strong>, {vol.organization}
                  {(vol.period || vol.startDate) && (
                    <span style={{ color: mutedColor, marginLeft: '8px' }}>
                      {vol.period || `${vol.startDate}${vol.endDate ? ` - ${vol.endDate}` : vol.current ? ' - Present' : ''}`}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const metadata = {
  id: 'PortfolioLayout' as const,
  name: 'Portfolio',
  description: 'Project-focused layout with grid-based portfolio showcase',
  suitableFor: ['creative-design', 'tech-startup'],
  complexity: 'complex' as const,
  atsCompatibility: 'low' as const,
  isUnique: true,
};
