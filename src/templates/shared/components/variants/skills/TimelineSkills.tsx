import * as React from 'react';

export interface TimelineSkillsProps {
  skills: string[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

const getYearsExperience = (index: number, totalSkills: number): string => {
  // Simulate years of experience based on position in list
  const percentile = (index + 1) / totalSkills;
  if (percentile <= 0.25) return '5+ years';
  if (percentile <= 0.5) return '3-5 years';
  if (percentile <= 0.75) return '1-3 years';
  return '<1 year';
};

export const TimelineSkills: React.FC<TimelineSkillsProps> = ({ skills, colors }) => {
  return (
    <div style={{
      position: 'relative',
      paddingLeft: '20px',
    }}>
      {/* Timeline line */}
      <div style={{
        position: 'absolute',
        left: '6px',
        top: '10px',
        bottom: '10px',
        width: '2px',
        backgroundColor: `${colors.primary}30`,
      }} />

      {skills.map((skill, index) => {
        const years = getYearsExperience(index, skills.length);

        return (
          <div key={index} style={{
            position: 'relative',
            marginBottom: '16px',
          }}>
            {/* Timeline dot */}
            <div style={{
              position: 'absolute',
              left: '-18px',
              top: '4px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: colors.primary,
              border: `2px solid #ffffff`,
            }} />

            <div>
              <div style={{
                fontSize: '12px',
                color: colors.text,
                fontWeight: 600,
                marginBottom: '2px',
              }}>
                {skill}
              </div>
              <div style={{
                fontSize: '9px',
                color: colors.muted,
                fontWeight: 500,
              }}>
                {years}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
