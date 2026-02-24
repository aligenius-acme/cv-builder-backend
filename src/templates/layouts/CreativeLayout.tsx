/**
 * CreativeLayout - Bold, asymmetric, artistic design
 *
 * Structure: Large color block header, asymmetric sections, bold typography
 * Suitable for: Creative design, marketing, arts roles
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const CreativeLayout: React.FC<LayoutProps> = ({ data, config }) => {
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
        fontFamily: "'Montserrat', 'Helvetica Neue', sans-serif",
        fontSize: `${fontSize.body}px`,
        color: textColor,
        backgroundColor: backgroundColor,
        maxWidth: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* Bold Color Block Header */}
      <div style={{
        backgroundColor: primaryColor,
        padding: '50px 40px',
        marginBottom: '40px',
        position: 'relative',
        clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '30px' }}>
          {contact.photoUrl && (
            <div>
              <PhotoCircle
                photoUrl={contact.photoUrl}
                name={contact.name || 'User'}
                size="large"
                position="left"
                primaryColor={secondaryColor}
              />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: `${fontSize.header + 10}px`,
              color: '#ffffff',
              margin: 0,
              fontWeight: 900,
              letterSpacing: '-1px',
              lineHeight: 1.1,
              marginBottom: '16px',
            }}>
              {contact.name?.toUpperCase() || 'YOUR NAME'}
            </h1>
            <div style={{
              fontSize: `${fontSize.body + 1}px`,
              color: '#ffffff',
              opacity: 0.95,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
            }}>
              {contact.email && <span>{contact.email}</span>}
              {contact.phone && <span>|</span>}
              {contact.phone && <span>{contact.phone}</span>}
              {contact.location && <span>|</span>}
              {contact.location && <span>{contact.location}</span>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: `0 ${margins.left}px ${margins.bottom}px` }}>
        {/* Summary - Full Width */}
        {summary && (
          <div style={{
            marginBottom: '40px',
            padding: '30px',
            backgroundColor: accentColor || '#f8f9fa',
            borderLeft: `6px solid ${primaryColor}`,
          }}>
            <p style={{
              fontSize: `${fontSize.body + 2}px`,
              color: textColor,
              lineHeight: 1.7,
              margin: 0,
              fontWeight: 500,
            }}>
              {summary}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '30px' }}>
          {/* Left Column - 60% */}
          <div style={{ flex: '0 0 60%' }}>
            {/* Experience */}
            {experience && experience.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{
                  fontSize: `${fontSize.subheader + 4}px`,
                  color: primaryColor,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '24px',
                  position: 'relative',
                  paddingLeft: '16px',
                }}>
                  <span style={{
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '6px',
                    backgroundColor: secondaryColor,
                    display: 'inline-block',
                    marginRight: '16px',
                  }}></span>
                  Experience
                </h2>
                {experience.map((exp, index) => (
                  <div key={index} style={{ marginBottom: '28px' }}>
                    <h3 style={{
                      fontSize: `${fontSize.subheader + 1}px`,
                      color: textColor,
                      fontWeight: 700,
                      margin: 0,
                      marginBottom: '6px',
                    }}>
                      {exp.title}
                    </h3>
                    <div style={{
                      fontSize: `${fontSize.body}px`,
                      color: primaryColor,
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}>
                      {exp.company}
                    </div>
                    <div style={{
                      fontSize: `${fontSize.body - 1}px`,
                      color: mutedColor,
                      marginBottom: '12px',
                    }}>
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      {exp.location && ` • ${exp.location}`}
                    </div>
                    {exp.description?.map((desc, i) => (
                      <p key={i} style={{
                        fontSize: `${fontSize.body}px`,
                        color: textColor,
                        lineHeight: 1.6,
                        margin: '0 0 8px 0',
                        paddingLeft: '16px',
                        borderLeft: `2px solid ${accentColor}`,
                      }}>
                        {desc}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{
                  fontSize: `${fontSize.subheader + 4}px`,
                  color: primaryColor,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '24px',
                  paddingLeft: '16px',
                }}>
                  <span style={{
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '6px',
                    backgroundColor: secondaryColor,
                    display: 'inline-block',
                    marginRight: '16px',
                  }}></span>
                  Projects
                </h2>
                {projects.map((project, index) => (
                  <div key={index} style={{ marginBottom: '20px' }}>
                    <h3 style={{
                      fontSize: `${fontSize.subheader}px`,
                      color: textColor,
                      fontWeight: 700,
                      margin: 0,
                      marginBottom: '8px',
                    }}>
                      {project.name}
                    </h3>
                    <p style={{
                      fontSize: `${fontSize.body}px`,
                      color: textColor,
                      lineHeight: 1.6,
                      margin: 0,
                      marginBottom: '6px',
                    }}>
                      {project.description}
                    </p>
                    {project.technologies && (
                      <div style={{
                        fontSize: `${fontSize.body - 1}px`,
                        color: primaryColor,
                        fontWeight: 600,
                      }}>
                        {project.technologies.join(' • ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - 40% */}
          <div style={{ flex: '0 0 40%' }}>
            {/* Skills */}
            {skills && skills.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{
                  fontSize: `${fontSize.subheader + 2}px`,
                  color: primaryColor,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '20px',
                }}>
                  Skills
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {skills.map((skill, index) => {
                    const skillText = typeof skill === 'string' ? skill : (skill as any).category || (skill as any).name || String(skill);
                    return (
                      <div
                        key={index}
                        style={{
                          fontSize: `${fontSize.body}px`,
                          color: '#ffffff',
                          backgroundColor: primaryColor,
                          padding: '10px 16px',
                          fontWeight: 600,
                          transform: index % 2 === 0 ? 'translateX(0)' : 'translateX(10px)',
                        }}
                      >
                        {skillText}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{
                  fontSize: `${fontSize.subheader + 2}px`,
                  color: primaryColor,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '20px',
                }}>
                  Education
                </h2>
                {education.map((edu, index) => (
                  <div key={index} style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: `${fontSize.subheader}px`, color: textColor, fontWeight: 700, margin: 0, marginBottom: '6px', lineHeight: 1.3 }}>
                      {edu.degree}
                    </h3>
                    <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor, lineHeight: 1.5 }}>
                      {edu.institution}<br />{edu.graduationDate}{edu.gpa && <><br />GPA: {edu.gpa}</>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {certifications && certifications.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: `${fontSize.subheader + 2}px`, color: primaryColor, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                  Certifications
                </h2>
                {certifications.map((cert, index) => (
                  <div key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginBottom: '10px', paddingLeft: '12px', borderLeft: `3px solid ${accentColor}` }}>
                    {typeof cert === 'string' ? cert : cert.name}
                    {typeof cert === 'object' && cert.date && <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>{cert.date}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: `${fontSize.subheader + 2}px`, color: primaryColor, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                  Languages
                </h2>
                {languages.map((lang, index) => (
                  <div key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginBottom: '8px', fontWeight: 600 }}>
                    {lang}
                  </div>
                ))}
              </div>
            )}

            {/* Awards */}
            {awards && awards.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: `${fontSize.subheader + 2}px`, color: primaryColor, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                  Awards
                </h2>
                {awards.map((award, index) => (
                  <div key={index} style={{ fontSize: `${fontSize.body}px`, color: textColor, marginBottom: '10px', paddingLeft: '12px', borderLeft: `3px solid ${accentColor}` }}>
                    {typeof award === 'string' ? award : award.name}
                    {typeof award === 'object' && award.date && <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>{award.date}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Volunteer Work */}
            {volunteerWork && volunteerWork.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: `${fontSize.subheader + 2}px`, color: primaryColor, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                  Volunteer Work
                </h2>
                {volunteerWork.map((vol, index) => (
                  <div key={index} style={{ marginBottom: '12px' }}>
                    {typeof vol === 'string' ? (
                      <div style={{ fontSize: `${fontSize.body}px`, color: textColor }}>{vol}</div>
                    ) : (
                      <>
                        <div style={{ fontSize: `${fontSize.body}px`, color: textColor, fontWeight: 700 }}>{vol.role}</div>
                        <div style={{ fontSize: `${fontSize.body - 1}px`, color: mutedColor }}>{vol.organization}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const metadata = {
  id: 'CreativeLayout' as const,
  name: 'Creative',
  description: 'Bold, asymmetric design with large color blocks and modern typography',
  suitableFor: ['creative-design', 'sales-marketing', 'tech-startup'],
  complexity: 'complex' as const,
  atsCompatibility: 'low' as const,
  isUnique: true,
};
