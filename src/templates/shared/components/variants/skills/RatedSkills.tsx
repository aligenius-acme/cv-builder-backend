import * as React from 'react';

export interface RatedSkillsProps {
  skills: string[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

const getSkillRating = (index: number, totalSkills: number): number => {
  // First 30% get 5 stars, next 30% get 4 stars, rest get 3 stars
  const percentile = (index + 1) / totalSkills;
  if (percentile <= 0.3) return 5;
  if (percentile <= 0.6) return 4;
  return 3;
};

export const RatedSkills: React.FC<RatedSkillsProps> = ({ skills, colors }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
    }}>
      {skills.map((skill, index) => {
        const rating = getSkillRating(index, skills.length);

        return (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '8px',
            borderBottom: `1px solid ${colors.primary}20`,
          }}>
            <span style={{
              fontSize: '11px',
              color: colors.text,
              fontWeight: 500,
            }}>
              {skill}
            </span>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '10px',
                    color: i < rating ? colors.primary : `${colors.muted}40`,
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
