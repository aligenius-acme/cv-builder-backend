import * as React from 'react';
import { EducationEntry } from '../../../../../types';

export interface DetailedEducationProps {
  education: EducationEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const DetailedEducation: React.FC<DetailedEducationProps> = ({ education, colors }) => {
  return (
    <div>
      {education.map((edu, index) => (
        <div key={index} style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '4px',
          }}>
            <h3 style={{
              fontSize: '13px',
              color: colors.text,
              fontWeight: 600,
              margin: 0,
            }}>
              {edu.degree}
            </h3>
            <span style={{
              fontSize: '10px',
              color: colors.muted,
              whiteSpace: 'nowrap',
              marginLeft: '16px',
            }}>
              {edu.graduationDate}
            </span>
          </div>

          <div style={{
            fontSize: '11px',
            color: colors.primary,
            fontWeight: 500,
            marginBottom: '4px',
          }}>
            {edu.institution}
            {edu.location && ` • ${edu.location}`}
            {edu.gpa && ` • GPA: ${edu.gpa}`}
          </div>

          {edu.achievements && edu.achievements.length > 0 && (
            <ul style={{
              margin: '8px 0 0 0',
              paddingLeft: '20px',
              listStyleType: 'circle',
            }}>
              {edu.achievements.map((achievement, i) => (
                <li key={i} style={{
                  fontSize: '10px',
                  color: colors.text,
                  lineHeight: 1.6,
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
