import * as React from 'react';
import { EducationEntry } from '../../../../../types';

export interface MinimalistEducationProps {
  education: EducationEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const MinimalistEducation: React.FC<MinimalistEducationProps> = ({ education, colors }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {education.map((edu, index) => (
        <div key={index}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}>
            <div style={{ flex: 1 }}>
              <span style={{
                fontSize: '12px',
                color: colors.text,
                fontWeight: 600,
              }}>
                {edu.degree}
              </span>
              <span style={{
                fontSize: '11px',
                color: colors.muted,
                marginLeft: '8px',
              }}>
                • {edu.institution}
              </span>
              {edu.gpa && (
                <span style={{
                  fontSize: '10px',
                  color: colors.primary,
                  marginLeft: '8px',
                  fontWeight: 600,
                }}>
                  GPA: {edu.gpa}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '10px',
              color: colors.muted,
              whiteSpace: 'nowrap',
              marginLeft: '16px',
            }}>
              {edu.graduationDate}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
