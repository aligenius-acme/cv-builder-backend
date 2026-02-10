import * as React from 'react';

export interface TableGridSkillsProps {
  skills: string[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const TableGridSkills: React.FC<TableGridSkillsProps> = ({ skills, colors }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1px',
      backgroundColor: `${colors.primary}30`,
      border: `1px solid ${colors.primary}30`,
    }}>
      {skills.map((skill, index) => (
        <div
          key={index}
          style={{
            padding: '10px 12px',
            backgroundColor: '#ffffff',
            fontSize: '11px',
            color: colors.text,
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {skill}
        </div>
      ))}
    </div>
  );
};
