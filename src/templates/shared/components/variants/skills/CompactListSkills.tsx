import * as React from 'react';

export interface CompactListSkillsProps {
  skills: string[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const CompactListSkills: React.FC<CompactListSkillsProps> = ({ skills, colors }) => {
  return (
    <div style={{
      fontSize: '11px',
      color: colors.text,
      lineHeight: 1.8,
    }}>
      {skills.join(' • ')}
    </div>
  );
};
