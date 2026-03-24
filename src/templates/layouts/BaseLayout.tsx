/**
 * BaseLayout - Simple, clean single-column layout
 *
 * This is the default layout migrated from BaseTemplate.tsx
 * Suitable for: All categories, high ATS compatibility
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const BaseLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, projects, languages, awards, volunteerWork } = data;
  const {
    primaryColor,
    secondaryColor,
    textColor,
    mutedColor,
    backgroundColor,
    accentColor,
    fontSize,
    margins,
    headerStyle,
    sectionStyle,
    skillsStyle,
    bulletStyle,
  } = config;

  // Render header based on style
  const renderHeader = () => {
    const headerContent = (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        justifyContent: 'space-between'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: `${fontSize.header}px`,
            color: primaryColor,
            margin: 0,
            fontWeight: 700,
            letterSpacing: '-0.5px'
          }}>
            {contact.name || 'Your Name'}
          </h1>
          <div style={{
            fontSize: `${fontSize.body}px`,
            color: mutedColor,
            marginTop: '8px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {contact.email && <span>{contact.email}</span>}
            {contact.phone && <span>{contact.phone}</span>}
            {contact.location && <span>{contact.location}</span>}
            {contact.linkedin && <span>{contact.linkedin}</span>}
            {contact.github && <span>{contact.github}</span>}
            {contact.website && <span>{contact.website}</span>}
          </div>
        </div>
        {contact.photoUrl && (
          <PhotoCircle
            photoUrl={contact.photoUrl}
            name={contact.name || 'User'}
            size="large"
            position="right"
            primaryColor={primaryColor}
          />
        )}
      </div>
    );

    if (headerStyle === 'banner') {
      return (
        <div style={{
          borderBottom: `3px solid ${primaryColor}`,
          padding: '30px 40px',
          marginBottom: '30px',
          marginTop: `-${margins.top}px`,
          marginLeft: `-${margins.left}px`,
          marginRight: `-${margins.right}px`,
        }}>
          {headerContent}
        </div>
      );
    }

    if (headerStyle === 'centered') {
      return (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {headerContent}
        </div>
      );
    }

    return (
      <div style={{ marginBottom: '30px' }}>
        {headerContent}
      </div>
    );
  };

  // Render section title based on style
  const renderSectionTitle = (title: string) => {
    const baseStyle = {
      fontSize: `${fontSize.subheader}px`,
      color: primaryColor,
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '1px',
      marginBottom: '16px',
      marginTop: '24px',
    };

    if (sectionStyle === 'underlined') {
      return (
        <h2 style={{
          ...baseStyle,
          borderBottom: `2px solid ${primaryColor}`,
          paddingBottom: '8px',
        }}>
          {title}
        </h2>
      );
    }

    if (sectionStyle === 'boxed') {
      return (
        <h2 style={{
          ...baseStyle,
          borderLeft: `4px solid ${primaryColor}`,
          paddingLeft: '12px',
        }}>
          {title}
        </h2>
      );
    }

    if (sectionStyle === 'highlighted' || sectionStyle === 'accent-bar') {
      return (
        <h2 style={{
          ...baseStyle,
          borderLeft: `4px solid ${primaryColor}`,
          paddingLeft: '12px',
        }}>
          {title}
        </h2>
      );
    }

    if (sectionStyle === 'dotted') {
      return (
        <h2 style={{
          ...baseStyle,
          borderBottom: `2px dotted ${primaryColor}`,
          paddingBottom: '8px',
        }}>
          {title}
        </h2>
      );
    }

    return <h2 style={baseStyle}>{title}</h2>;
  };

  // Render bullet point based on style
  const renderBullet = () => {
    const bulletStyles = {
      dot: '•',
      dash: '—',
      arrow: '→',
      check: '✓',
      none: '',
    };
    return bulletStyles[bulletStyle] || '•';
  };

  // Render skills based on style
  const renderSkills = () => {
    if (!skills || skills.length === 0) return null;

    if (skillsStyle === 'pills') {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {skills.map((skill, index) => (
            <span
              key={index}
              style={{
                color: primaryColor,
                border: `1px solid ${primaryColor}30`,
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: `${fontSize.body - 1}px`,
                fontWeight: 500,
              }}
            >
              {typeof skill === 'string' ? skill : skill.category}
            </span>
          ))}
        </div>
      );
    }

    if (skillsStyle === 'grid') {
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}>
          {skills.map((skill, index) => (
            <div
              key={index}
              style={{
                fontSize: `${fontSize.body}px`,
                color: textColor,
              }}
            >
              {renderBullet()} {typeof skill === 'string' ? skill : skill.category}
            </div>
          ))}
        </div>
      );
    }

    // Default: inline
    return (
      <div style={{ fontSize: `${fontSize.body}px`, color: textColor }}>
        {skills.join(' • ')}
      </div>
    );
  };

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
      {renderHeader()}

      {/* Summary Section */}
      {summary && (
        <div>
          {renderSectionTitle('Professional Summary')}
          <p style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, margin: 0 }}>
            {summary}
          </p>
        </div>
      )}

      {/* Experience Section */}
      {experience && experience.length > 0 && (
        <div>
          {renderSectionTitle('Experience')}
          {experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{
                  fontSize: `${fontSize.subheader}px`,
                  color: textColor,
                  fontWeight: 600,
                  margin: 0,
                }}>
                  {exp.title}
                </h3>
                <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, whiteSpace: 'nowrap' }}>
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              <div style={{
                fontSize: `${fontSize.body}px`,
                color: mutedColor,
                marginTop: '4px',
                marginBottom: '8px',
              }}>
                {exp.company}{exp.location && ` • ${exp.location}`}
              </div>
              <ul style={{ margin: 0, paddingLeft: bulletStyle === 'none' ? 0 : '20px', listStyle: 'none' }}>
                {exp.description?.map((desc, i) => (
                  <li key={i} style={{
                    fontSize: `${fontSize.body}px`,
                    color: textColor,
                    lineHeight: 1.6,
                    marginBottom: '4px',
                  }}>
                    {bulletStyle !== 'none' && <span style={{ marginRight: '8px' }}>{renderBullet()}</span>}
                    {desc}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education Section */}
      {education && education.length > 0 && (
        <div>
          {renderSectionTitle('Education')}
          {education.map((edu, index) => (
            <div key={index} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{
                  fontSize: `${fontSize.subheader}px`,
                  color: textColor,
                  fontWeight: 600,
                  margin: 0,
                }}>
                  {edu.degree}
                </h3>
                <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>
                  {edu.graduationDate}
                </span>
              </div>
              <div style={{
                fontSize: `${fontSize.body}px`,
                color: mutedColor,
                marginTop: '4px',
              }}>
                {edu.institution}{edu.location && ` • ${edu.location}`}
                {edu.gpa && ` • GPA: ${edu.gpa}`}
              </div>
              {edu.achievements && edu.achievements.length > 0 && (
                <ul style={{ margin: '8px 0 0 0', paddingLeft: bulletStyle === 'none' ? 0 : '20px', listStyle: 'none' }}>
                  {edu.achievements.map((achievement, i) => (
                    <li key={i} style={{
                      fontSize: `${fontSize.body}px`,
                      color: textColor,
                      lineHeight: 1.6,
                    }}>
                      {bulletStyle !== 'none' && <span style={{ marginRight: '8px' }}>{renderBullet()}</span>}
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills Section */}
      {skills && skills.length > 0 && (
        <div>
          {renderSectionTitle('Skills')}
          {renderSkills()}
        </div>
      )}

      {/* Projects Section */}
      {projects && projects.length > 0 && (
        <div>
          {renderSectionTitle('Projects')}
          {projects.map((project, index) => (
            <div key={index} style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: `${fontSize.subheader}px`,
                color: textColor,
                fontWeight: 600,
                margin: 0,
              }}>
                {project.name}
              </h3>
              {Array.isArray(project.description) && project.description.length > 1 ? (
                <ul style={{ margin: '4px 0', paddingLeft: '18px', listStyleType: 'disc' }}>
                  {project.description.map((d, i) => (
                    <li key={i} style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.6, marginBottom: '2px' }}>{d}</li>
                  ))}
                </ul>
              ) : (
                <p style={{
                  fontSize: `${fontSize.body}px`,
                  color: textColor,
                  lineHeight: 1.6,
                  margin: '4px 0',
                }}>
                  {Array.isArray(project.description) ? (project.description[0] || '') : project.description}
                </p>
              )}
              {project.technologies && (
                <div style={{
                  fontSize: `${fontSize.body - 1}px`,
                  color: mutedColor,
                  marginTop: '4px',
                }}>
                  Technologies: {project.technologies.join(', ')}
                </div>
              )}
              {project.url && (
                <div style={{
                  fontSize: `${fontSize.body - 1}px`,
                  color: primaryColor,
                  marginTop: '4px',
                }}>
                  {project.url}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications Section */}
      {certifications && certifications.length > 0 && (
        <div>
          {renderSectionTitle('Certifications')}
          {certifications.map((cert, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{
                  fontSize: `${fontSize.body}px`,
                  color: textColor,
                  fontWeight: 500,
                }}>
                  {typeof cert === 'string' ? cert : cert.name}
                </span>
                {typeof cert === 'object' && cert.date && (
                  <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>
                    {cert.date}
                  </span>
                )}
              </div>
              {typeof cert === 'object' && cert.issuer && (
                <div style={{
                  fontSize: `${fontSize.body - 1}px`,
                  color: mutedColor,
                  marginTop: '2px',
                }}>
                  {cert.issuer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Languages Section */}
      {languages && languages.length > 0 && (
        <div>
          {renderSectionTitle('Languages')}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: `${fontSize.body}px`,
            color: textColor,
          }}>
            {languages.map((language, index) => (
              <span key={index}>
                {language}{index < languages.length - 1 && ' •'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Awards Section */}
      {awards && awards.length > 0 && (
        <div>
          {renderSectionTitle('Awards & Honors')}
          <ul style={{ margin: 0, paddingLeft: bulletStyle === 'none' ? 0 : '20px', listStyle: 'none' }}>
            {awards.map((award, index) => (
              <li key={index} style={{
                fontSize: `${fontSize.body}px`,
                color: textColor,
                lineHeight: 1.6,
                marginBottom: '6px',
              }}>
                {bulletStyle !== 'none' && <span style={{ marginRight: '8px' }}>{renderBullet()}</span>}
                {typeof award === 'string' ? award : award.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Volunteer Work Section */}
      {volunteerWork && volunteerWork.length > 0 && (
        <div>
          {renderSectionTitle('Volunteer Work')}
          {volunteerWork.map((vol, index) => {
            // Handle both string and object formats
            if (typeof vol === 'string') {
              return (
                <div key={index} style={{
                  fontSize: `${fontSize.body}px`,
                  color: textColor,
                  lineHeight: 1.6,
                  marginBottom: '6px',
                }}>
                  {bulletStyle !== 'none' && <span style={{ marginRight: '8px' }}>{renderBullet()}</span>}
                  {vol}
                </div>
              );
            }

            // Render structured volunteer work entry
            return (
              <div key={index} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{
                    fontSize: `${fontSize.subheader}px`,
                    color: textColor,
                    fontWeight: 600,
                    margin: 0,
                  }}>
                    {vol.role}
                  </h3>
                  {vol.startDate && (
                    <span style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, whiteSpace: 'nowrap' }}>
                      {vol.startDate} - {vol.current ? 'Present' : vol.endDate}
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: `${fontSize.body}px`,
                  color: mutedColor,
                  marginTop: '4px',
                  marginBottom: '8px',
                }}>
                  {vol.organization}{vol.location && ` • ${vol.location}`}
                </div>
                {vol.description && vol.description.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: bulletStyle === 'none' ? 0 : '20px', listStyle: 'none' }}>
                    {vol.description.map((desc, i) => (
                      <li key={i} style={{
                        fontSize: `${fontSize.body}px`,
                        color: textColor,
                        lineHeight: 1.6,
                        marginBottom: '4px',
                      }}>
                        {bulletStyle !== 'none' && <span style={{ marginRight: '8px' }}>{renderBullet()}</span>}
                        {desc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const metadata = {
  id: 'BaseLayout' as const,
  name: 'Base Layout',
  description: 'Simple, clean single-column layout with configurable styling options',
  suitableFor: ['all'],
  complexity: 'simple' as const,
  atsCompatibility: 'high' as const,
  isUnique: false,
};
