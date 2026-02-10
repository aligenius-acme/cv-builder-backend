import * as React from 'react';

export interface ChipSkillsProps {
  skills: string[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const ChipSkills: React.FC<ChipSkillsProps> = ({ skills, colors }) => {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
    }}>
      {skills.map((skill, index) => (
        <span
          key={index}
          style={{
            padding: '4px 10px',
            backgroundColor: colors.primary,
            color: '#ffffff',
            borderRadius: '3px',
            fontSize: '9px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {skill}
        </span>
      ))}
    </div>
  );
};
