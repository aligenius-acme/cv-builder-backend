import * as React from 'react';
import { EducationEntry } from '../../../../../types';

export interface BadgeEducationProps {
  education: EducationEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

const getDegreeBadge = (degree: string): string => {
  const lowerDegree = degree.toLowerCase();
  if (lowerDegree.includes('phd') || lowerDegree.includes('doctorate')) return 'PhD';
  if (lowerDegree.includes('master') || lowerDegree.includes('mba')) return 'MS';
  if (lowerDegree.includes('bachelor')) return 'BS';
  if (lowerDegree.includes('associate')) return 'AS';
  return 'CERT';
};

export const BadgeEducation: React.FC<BadgeEducationProps> = ({ education, colors }) => {
  return (
    <div>
      {education.map((edu, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '20px',
            alignItems: 'flex-start',
          }}
        >
          <div style={{
            flexShrink: 0,
            width: '50px',
            height: '50px',
            backgroundColor: colors.primary,
            color: '#ffffff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            textAlign: 'center',
            padding: '4px',
            boxShadow: `0 2px 4px ${colors.primary}40`,
          }}>
            {getDegreeBadge(edu.degree)}
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
                listStyleType: 'square',
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
