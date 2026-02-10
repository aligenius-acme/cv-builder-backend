import * as React from 'react';
import { EducationEntry } from '../../../../../types';

export interface IconEducationProps {
  education: EducationEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

const getDegreeIcon = (degree: string): string => {
  const lowerDegree = degree.toLowerCase();
  if (lowerDegree.includes('phd') || lowerDegree.includes('doctorate')) return '🎓';
  if (lowerDegree.includes('master')) return '🎓';
  if (lowerDegree.includes('bachelor')) return '🎓';
  if (lowerDegree.includes('associate')) return '📚';
  if (lowerDegree.includes('certificate') || lowerDegree.includes('diploma')) return '📜';
  return '🎓';
};

export const IconEducation: React.FC<IconEducationProps> = ({ education, colors }) => {
  return (
    <div>
      {education.map((edu, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            flexShrink: 0,
            backgroundColor: `${colors.primary}15`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}>
            {getDegreeIcon(edu.degree)}
          </div>
          <div style={{ flex: 1 }}>
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
                margin: 0,
                paddingLeft: '18px',
                listStyleType: 'disc',
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
