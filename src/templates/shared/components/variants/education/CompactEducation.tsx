import * as React from 'react';
import { EducationEntry } from '../../../../../types';

export interface CompactEducationProps {
  education: EducationEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const CompactEducation: React.FC<CompactEducationProps> = ({ education, colors }) => {
  return (
    <div>
      {education.map((edu, index) => (
        <div
          key={index}
          style={{
            marginBottom: '10px',
            paddingBottom: '10px',
            borderBottom: index < education.length - 1 ? `1px solid ${colors.primary}20` : 'none',
          }}
        >
          <div style={{
            fontSize: '11px',
            color: colors.text,
            lineHeight: 1.5,
          }}>
            <span style={{ fontWeight: 700, color: colors.primary }}>
              {edu.degree}
            </span>
            {' • '}
            <span style={{ fontWeight: 500 }}>
              {edu.institution}
            </span>
            {edu.gpa && (
              <>
                {' • '}
                <span style={{ color: colors.muted, fontSize: '10px' }}>
                  GPA: {edu.gpa}
                </span>
              </>
            )}
            {' • '}
            <span style={{ color: colors.muted, fontSize: '10px' }}>
              {edu.graduationDate}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
