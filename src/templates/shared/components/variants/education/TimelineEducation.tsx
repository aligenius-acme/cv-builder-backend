import * as React from 'react';
import { EducationEntry } from '../../../../../types';

export interface TimelineEducationProps {
  education: EducationEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const TimelineEducation: React.FC<TimelineEducationProps> = ({ education, colors }) => {
  return (
    <div style={{ position: 'relative', paddingLeft: '32px' }}>
      {/* Timeline line */}
      <div style={{
        position: 'absolute',
        left: '8px',
        top: '8px',
        bottom: '0',
        width: '2px',
        backgroundColor: `${colors.primary}30`,
      }} />

      {education.map((edu, index) => (
        <div key={index} style={{
          marginBottom: '20px',
          position: 'relative',
        }}>
          {/* Timeline dot */}
          <div style={{
            position: 'absolute',
            left: '-28px',
            top: '4px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: colors.primary,
            border: `2px solid #ffffff`,
          }} />

          <div style={{
            fontSize: '10px',
            color: colors.primary,
            fontWeight: 700,
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {edu.graduationDate}
          </div>

          <h3 style={{
            fontSize: '13px',
            color: colors.text,
            fontWeight: 600,
            margin: '0 0 2px 0',
          }}>
            {edu.degree}
          </h3>

          <div style={{
            fontSize: '11px',
            color: colors.muted,
          }}>
            {edu.institution}
            {edu.location && ` • ${edu.location}`}
            {edu.gpa && ` • GPA: ${edu.gpa}`}
          </div>

          {edu.achievements && edu.achievements.length > 0 && (
            <ul style={{
              margin: '8px 0 0 0',
              paddingLeft: '16px',
              listStyleType: 'disc',
            }}>
              {edu.achievements.map((achievement, i) => (
                <li key={i} style={{
                  fontSize: '10px',
                  color: colors.text,
                  lineHeight: 1.5,
                  marginBottom: '2px',
                }}>
                  {achievement}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};
