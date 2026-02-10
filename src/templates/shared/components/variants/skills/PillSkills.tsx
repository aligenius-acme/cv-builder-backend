import * as React from 'react';

export interface PillSkillsProps {
  skills: string[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const PillSkills: React.FC<PillSkillsProps> = ({ skills, colors }) => {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      justifyContent: 'flex-start',
    }}>
      {skills.map((skill, index) => (
        <span
          key={index}
          style={{
            padding: '8px 16px',
            backgroundColor: `${colors.primary}15`,
            color: colors.primary,
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 600,
            border: `1px solid ${colors.primary}30`,
          }}
        >
          {skill}
        </span>
      ))}
    </div>
  );
};
