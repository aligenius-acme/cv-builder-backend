/**
 * AcademicLayout - Research and academia focused layout
 *
 * Structure: Publications emphasis, academic credentials, traditional formatting
 * Suitable for: Researchers, professors, academic positions
 */

import * as React from 'react';
import { LayoutProps } from './types';
import { PhotoCircle } from '../shared/components/PhotoCircle';

export const AcademicLayout: React.FC<LayoutProps> = ({ data, config }) => {
  const { contact, summary, experience, education, skills, certifications, awards, projects, languages, volunteerWork } = data;
  const {
    primaryColor,
    textColor,
    mutedColor,
    backgroundColor,
    fontSize,
    margins,
  } = config;

  return (
    <div
      style={{
        fontFamily: "'Garamond', 'Times New Roman', serif",
        fontSize: `${fontSize.body}px`,
        color: textColor,
        backgroundColor: backgroundColor,
        padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
        maxWidth: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
      }}
    >
      {/* Academic Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: `1px solid ${mutedColor}`,
      }}>
        {contact.photoUrl && (
          <div style={{ marginBottom: '16px' }}>
            <PhotoCircle
              photoUrl={contact.photoUrl}
              name={contact.name || 'User'}
              size="medium"
              position="center"
              primaryColor={primaryColor}
            />
          </div>
        )}
        <h1 style={{
          fontSize: `${fontSize.header + 2}px`,
          color: primaryColor,
          margin: 0,
          fontWeight: 700,
          marginBottom: '8px',
        }}>
          {contact.name || 'Your Name'}
        </h1>
        <div style={{
          fontSize: `${fontSize.body}px`,
          color: mutedColor,
          lineHeight: 1.6,
        }}>
          {contact.email && <div>{contact.email}</div>}
          {contact.phone && <div>{contact.phone}</div>}
          {contact.location && <div>{contact.location}</div>}
          {contact.website && <div>{contact.website}</div>}
        </div>
      </div>

      {/* Research Interests / Summary */}
      {summary && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 1}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '12px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Research Interests
          </h2>
          <p style={{
            fontSize: `${fontSize.body}px`,
            color: textColor,
            lineHeight: 1.8,
            margin: 0,
            textAlign: 'justify',
          }}>
            {summary}
          </p>
        </div>
      )}

      {/* Education - Prominent for academics */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 1}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: '8px',
          }}>
            Education
          </h2>
          {education.map((edu, index) => (
            <div key={index} style={{ marginBottom: '16px' }}>
              <h3 style={{
                fontSize: `${fontSize.subheader}px`,
                color: textColor,
                fontWeight: 700,
                margin: 0,
                marginBottom: '4px',
              }}>
                {edu.degree}
              </h3>
              <div style={{
                fontSize: `${fontSize.body}px`,
                color: mutedColor,
                fontStyle: 'italic',
                marginBottom: '4px',
              }}>
                {edu.institution}, {edu.location}
              </div>
              <div style={{
                fontSize: `${fontSize.body - 1}px`,
                color: mutedColor,
              }}>
                {edu.graduationDate}
                {edu.gpa && ` • GPA: ${edu.gpa}`}
              </div>
              {edu.achievements && edu.achievements.length > 0 && (
                <ul style={{ margin: '8px 0 0 20px', listStyleType: 'circle' }}>
                  {edu.achievements.map((achievement, i) => (
                    <li key={i} style={{
                      fontSize: `${fontSize.body}px`,
                      color: textColor,
                      lineHeight: 1.6,
                    }}>
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Research/Academic Experience */}
      {experience && experience.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 1}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: '8px',
          }}>
            Academic & Research Experience
          </h2>
          {experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
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
                  fontSize: `${fontSize.body}px`,
                  color: mutedColor,
                  fontStyle: 'italic',
                  whiteSpace: 'nowrap',
                }}>
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              <div style={{
                fontSize: `${fontSize.body}px`,
                color: mutedColor,
                fontStyle: 'italic',
                marginTop: '4px',
                marginBottom: '8px',
              }}>
                {exp.company}
                {exp.location && `, ${exp.location}`}
              </div>
              <ul style={{ margin: 0, paddingLeft: '24px', listStyleType: 'disc' }}>
                {exp.description?.map((desc, i) => (
                  <li key={i} style={{
                    fontSize: `${fontSize.body}px`,
                    color: textColor,
                    lineHeight: 1.7,
                    marginBottom: '6px',
                  }}>
                    {desc}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Publications / Projects */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 1}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: '8px',
          }}>
            Publications & Research
          </h2>
          {projects.map((project, index) => (
            <div key={index} style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.7 }}>
                <strong>{project.name}.</strong>
                {project.url && <span style={{ color: primaryColor }}> [{project.url}]</span>}
              </div>
              {Array.isArray(project.description) && project.description.length > 1 ? (
                <ul style={{ margin: '4px 0 0 0', paddingLeft: '24px', listStyleType: 'disc' }}>
                  {project.description.map((d, di) => (
                    <li key={di} style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.7, marginBottom: '6px' }}>{d}</li>
                  ))}
                </ul>
              ) : (
                <div style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.7 }}>
                  {Array.isArray(project.description) ? (project.description[0] || '') : project.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills & Expertise */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 1}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: '8px',
          }}>
            Areas of Expertise
          </h2>
          <div style={{
            fontSize: `${fontSize.body}px`,
            color: textColor,
            lineHeight: 1.8,
            textAlign: 'justify',
          }}>
            {skills.map((skill, index) => {
              const skillText = typeof skill === 'string' ? skill : (skill as any).category || (skill as any).name || String(skill);
              return (
                <span key={index}>
                  {skillText}
                  {index < skills.length - 1 && ' • '}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Honors & Awards */}
      {awards && awards.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 1}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: '8px',
          }}>
            Honors & Awards
          </h2>
          <ul style={{ margin: 0, paddingLeft: '24px', listStyleType: 'disc' }}>
            {awards.map((award, index) => (
              <li key={index} style={{
                fontSize: `${fontSize.body}px`,
                color: textColor,
                lineHeight: 1.7,
                marginBottom: '8px',
              }}>
                {typeof award === 'string' ? award : award.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Professional Affiliations / Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 1}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: '8px',
          }}>
            Professional Affiliations
          </h2>
          <ul style={{ margin: 0, paddingLeft: '24px', listStyleType: 'disc' }}>
            {certifications.map((cert, index) => (
              <li key={index} style={{
                fontSize: `${fontSize.body}px`,
                color: textColor,
                lineHeight: 1.7,
                marginBottom: '6px',
              }}>
                {typeof cert === 'string' ? cert : `${cert.name}${cert.issuer ? `, ${cert.issuer}` : ''}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 1}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: '8px',
          }}>
            Languages
          </h2>
          <div style={{
            fontSize: `${fontSize.body}px`,
            color: textColor,
            lineHeight: 1.8,
            textAlign: 'center',
          }}>
            {languages.join(' • ')}
          </div>
        </div>
      )}

      {/* Volunteer Work / Community Service */}
      {volunteerWork && volunteerWork.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            fontSize: `${fontSize.subheader + 1}px`,
            color: primaryColor,
            fontWeight: 700,
            marginBottom: '16px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: `2px solid ${primaryColor}`,
            paddingBottom: '8px',
          }}>
            Service & Community
          </h2>
          {volunteerWork.map((vol, index) => (
            <div key={index} style={{ marginBottom: '14px' }}>
              {typeof vol === 'string' ? (
                <div style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.7 }}>• {vol}</div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ fontSize: `${fontSize.subheader}px`, color: textColor, fontWeight: 700, margin: 0 }}>
                      {vol.role}
                    </h3>
                    <span style={{ fontSize: `${fontSize.body}px`, color: mutedColor, fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                      {vol.period || `${vol.startDate || ''}${vol.endDate ? ` – ${vol.endDate}` : vol.current ? ' – Present' : ''}`}
                    </span>
                  </div>
                  <div style={{ fontSize: `${fontSize.body}px`, color: mutedColor, fontStyle: 'italic', marginTop: '4px', marginBottom: '6px' }}>
                    {vol.organization}{vol.location && `, ${vol.location}`}
                  </div>
                  {vol.description && vol.description.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: '24px', listStyleType: 'disc' }}>
                      {vol.description.map((desc, i) => (
                        <li key={i} style={{ fontSize: `${fontSize.body}px`, color: textColor, lineHeight: 1.7, marginBottom: '4px' }}>
                          {desc}
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
  id: 'AcademicLayout' as const,
  name: 'Academic',
  description: 'Traditional academic CV layout with emphasis on education and research',
  suitableFor: ['academic-research', 'education-teaching'],
  complexity: 'simple' as const,
  atsCompatibility: 'high' as const,
  isUnique: true,
};
