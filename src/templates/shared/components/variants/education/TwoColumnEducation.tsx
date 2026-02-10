import * as React from 'react';
import { EducationEntry } from '../../../../../types';

export interface TwoColumnEducationProps {
  education: EducationEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const TwoColumnEducation: React.FC<TwoColumnEducationProps> = ({ education, colors }) => {
  return (
    <div>
      {education.map((edu, index) => (
        <div
          key={index}
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr',
            gap: '20px',
            marginBottom: '20px',
          }}
        >
          <div style={{
            fontSize: '10px',
            color: colors.primary,
            fontWeight: 700,
            paddingTop: '2px',
          }}>
            {edu.graduationDate}
            {edu.gpa && (
              <div style={{
                marginTop: '4px',
                fontSize: '9px',
                color: colors.muted,
              }}>
                GPA: {edu.gpa}
              </div>
            )}
          </div>
          <div>
            <h3 style={{
              fontSize: '13px',
              color: colors.text,
              fontWeight: 600,
              margin: '0 0 4px 0',
            }}>
              {edu.degree}
            </h3>
            <div style={{
              fontSize: '11px',
              color: colors.primary,
              fontWeight: 500,
              marginBottom: '8px',
            }}>
              {edu.institution}
            </div>
            {edu.achievements && edu.achievements.length > 0 && (
              <ul style={{
                margin: 0,
                paddingLeft: '18px',
                listStyleType: 'circle',
              }}>
                {edu.achievements.map((achievement: string, i: number) => (
                  <li key={i} style={{
                    fontSize: '10px',
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
        </div>
      ))}
    </div>
  );
};
