/**
 * InfographicLayout - Visual layout with skill bars and modern design
 *
 * Structure: Visual elements, skill bars, icon-based, modern aesthetic
 * Suitable for: Creative roles, modern professionals, visual portfolios
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const InfographicLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, languages } = data;
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

  // Skill bar rendering
  const renderSkillBar = (skill: string, level: number = 85) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '4px',
      }}>
        <span style={{
          fontSize: `${fontSize.body}px`,
          color: textColor,
          fontWeight: 600,
        }}>
          {skill}
        </span>
      </div>
      <div style={{
        height: '8px',
        backgroundColor: `${primaryColor}20`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${level}%`,
          backgroundColor: primaryColor,
        }}></div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        fontFamily: "'Roboto', 'Helvetica Neue', sans-serif",
        fontSize: `${fontSize.body}px`,
        color: textColor,
        backgroundColor: backgroundColor,
        maxWidth: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        display: 'flex',
      }}
    >
      {/* Left Sidebar - 35% */}
      <div style={{
        width: '35%',
        backgroundColor: `${primaryColor}15`,
        padding: '40px 30px',
      }}>
        {/* Photo */}
        {contact.photoUrl && (
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <PhotoCircle
              photoUrl={contact.photoUrl}
              name={contact.name || 'User'}
              size="large"
              position="center"
              primaryColor={primaryColor}
            />
          </div>
        )}

        {/* Contact Info with Icons */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{
            fontSize: `${fontSize.subheader}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Contact
          </h3>
          <div style={{ fontSize: `${fontSize.body - 1}px`, lineHeight: 2 }}>
            {contact.email && (
              <div style={{ marginBottom: '8px', color: textColor }}>
                <span style={{ marginRight: '8px' }}>✉</span>
                <span>{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div style={{ marginBottom: '8px', color: textColor }}>
                <span style={{ marginRight: '8px' }}>☎</span>
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.location && (
              <div style={{ marginBottom: '8px', color: textColor }}>
                <span style={{ marginRight: '8px' }}>📍</span>
                <span>{contact.location}</span>
              </div>
            )}
            {contact.linkedin && (
              <div style={{ marginBottom: '8px', color: textColor, wordBreak: 'break-word' }}>
                <span style={{ marginRight: '8px' }}>🔗</span>
                <span>{contact.linkedin}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills with Bars */}
        {skills && skills.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 700,
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Skills
            </h3>
            {skills.slice(0, 8).map((skill, index) => {
              const skillText = typeof skill === 'string' ? skill : (skill as any).category || (skill as any).name || String(skill);
              // Random skill level between 75-95 for visual variety
              const level = 75 + (index * 3);
              return (
                <div key={index}>
                  {renderSkillBar(skillText, level > 95 ? 95 : level)}
                </div>
              );
            })}
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 700,
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Languages
            </h3>
            {languages.map((lang, index) => (
              <div key={index} style={{
                fontSize: `${fontSize.body}px`,
                color: textColor,
                marginBottom: '8px',
              }}>
                🌐 {lang}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div>
            <h3 style={{
              fontSize: `${fontSize.subheader}px`,
              color: primaryColor,
              fontWeight: 700,
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Certifications
            </h3>
            {certifications.slice(0, 4).map((cert, index) => (
              <div key={index} style={{
                fontSize: `${fontSize.body - 1}px`,
                color: textColor,
                marginBottom: '10px',
                lineHeight: 1.4,
              }}>
                ✓ {typeof cert === 'string' ? cert : cert.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Main Content - 65% */}
      <div style={{ flex: 1, padding: '40px 40px' }}>
        {/* Name Header */}
        <h1 style={{
          fontSize: `${fontSize.header + 6}px`,
          color: primaryColor,
          margin: 0,
          fontWeight: 700,
          marginBottom: '30px',
          letterSpacing: '-0.5px',
        }}>
          {contact.name || 'Your Name'}
        </h1>

        {/* Summary */}
        {summary && (
          <div style={{
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: `${secondaryColor}15`,
            borderLeft: `4px solid ${secondaryColor}`,
          }}>
            <p style={{
              fontSize: `${fontSize.body + 1}px`,
              color: textColor,
              lineHeight: 1.7,
              margin: 0,
            }}>
              {summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{
              fontSize: `${fontSize.subheader + 2}px`,
              color: primaryColor,
              fontWeight: 700,
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              paddingBottom: '10px',
              borderBottom: `2px solid ${primaryColor}`,
            }}>
              Experience
            </h2>
            {experience.map((exp, index) => (
              <div key={index} style={{ marginBottom: '24px', position: 'relative', paddingLeft: '20px' }}>
                {/* Bullet point */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '6px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: secondaryColor,
                }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{
                    fontSize: `${fontSize.subheader}px`,
                    color: textColor,
                    fontWeight: 700,
                    margin: 0,
                  }}>
                    {exp.title}
                  </h3>
                  <span style={{
                    fontSize: `${fontSize.body - 1}px`,
                    color: mutedColor,
                    whiteSpace: 'nowrap',
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
                  {exp.location && ` • ${exp.location}`}
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                  {exp.description?.map((desc, i) => (
                    <li key={i} style={{
                      fontSize: `${fontSize.body}px`,
                      color: textColor,
                      lineHeight: 1.6,
                      marginBottom: '4px',
                    }}>
                      → {desc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <h2 style={{
              fontSize: `${fontSize.subheader + 2}px`,
              color: primaryColor,
              fontWeight: 700,
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              paddingBottom: '10px',
              borderBottom: `2px solid ${primaryColor}`,
            }}>
              Education
            </h2>
            {education.map((edu, index) => (
              <div key={index} style={{ marginBottom: '16px', paddingLeft: '20px', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '6px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: secondaryColor,
                }}></div>

                <h3 style={{
                  fontSize: `${fontSize.subheader}px`,
                  color: textColor,
                  fontWeight: 700,
                  margin: 0,
                }}>
                  {edu.degree}
                </h3>
                <div style={{
                  fontSize: `${fontSize.body}px`,
                  color: mutedColor,
                  marginTop: '4px',
                }}>
                  {edu.institution} • {edu.graduationDate}
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const metadata = {
  id: 'InfographicLayout' as const,
  name: 'Infographic',
  description: 'Visual layout with skill bars and modern infographic design',
  suitableFor: ['creative-design', 'sales-marketing'],
  complexity: 'complex' as const,
  atsCompatibility: 'low' as const,
  isUnique: true,
};
