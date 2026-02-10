import * as React from 'react';
import { EducationEntry } from '../../../../../types';

export interface CardEducationProps {
  education: EducationEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const CardEducation: React.FC<CardEducationProps> = ({ education, colors }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: education.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
    }}>
      {education.map((edu, index) => (
        <div
          key={index}
          style={{
            padding: '16px',
            border: `2px solid ${colors.primary}30`,
            borderRadius: '8px',
            backgroundColor: `${colors.primary}05`,
          }}
        >
          <h3 style={{
            fontSize: '13px',
            color: colors.primary,
            fontWeight: 700,
            margin: '0 0 6px 0',
          }}>
            {edu.degree}
          </h3>
          <div style={{
            fontSize: '11px',
            color: colors.text,
            fontWeight: 600,
            marginBottom: '4px',
          }}>
            {edu.institution}
          </div>
          <div style={{
            fontSize: '9px',
            color: colors.muted,
            marginBottom: '8px',
          }}>
            {edu.graduationDate}
            {edu.gpa && ` • GPA: ${edu.gpa}`}
          </div>
          {edu.achievements && edu.achievements.length > 0 && (
            <ul style={{
              margin: '8px 0 0 0',
              paddingLeft: '18px',
              listStyleType: 'disc',
            }}>
              {edu.achievements.map((achievement: string, i: number) => (
                <li key={i} style={{
                  fontSize: '9px',
                  color: colors.text,
                  lineHeight: 1.5,
                  marginBottom: '3px',
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
