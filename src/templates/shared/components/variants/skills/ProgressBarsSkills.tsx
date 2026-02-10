import * as React from 'react';

export interface ProgressBarsSkillsProps {
  skills: string[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const ProgressBarsSkills: React.FC<ProgressBarsSkillsProps> = ({ skills, colors }) => {
  // Simple heuristic: skills listed first are assumed more proficient
  const getSkillLevel = (index: number, total: number): number => {
    if (index < total * 0.3) return 90;
    if (index < total * 0.6) return 75;
    return 60;
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
    }}>
      {skills.map((skill, index) => {
        const level = getSkillLevel(index, skills.length);
        return (
          <div key={index}>
            <div style={{
              fontSize: '10px',
              color: colors.text,
              marginBottom: '4px',
              fontWeight: 500,
            }}>
              {skill}
            </div>
            <div style={{
              height: '4px',
              backgroundColor: `${colors.primary}20`,
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${level}%`,
                backgroundColor: colors.primary,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
