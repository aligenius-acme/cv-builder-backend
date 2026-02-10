import * as React from 'react';
import { ExperienceEntry } from '../../../../../types';

export interface SkillsTaggedExperienceProps {
  experiences: ExperienceEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

const extractSkills = (description: string[]): string[] => {
  const techWords = ['React', 'Node', 'Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Git', 'API', 'MongoDB'];
  const skills: string[] = [];
  description.forEach(desc => {
    techWords.forEach(tech => {
      if (desc.toLowerCase().includes(tech.toLowerCase()) && !skills.includes(tech)) {
        skills.push(tech);
      }
    });
  });
  return skills.slice(0, 5);
};

export const SkillsTaggedExperience: React.FC<SkillsTaggedExperienceProps> = ({ experiences, colors }) => {
  return (
    <div>
      {experiences.map((exp, index) => {
        const skills = exp.description ? extractSkills(exp.description) : [];
        return (
          <div key={index} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
              <h3 style={{
                fontSize: '14px',
                color: colors.text,
                fontWeight: 600,
                margin: 0,
              }}>
                {exp.title}
              </h3>
              <span style={{
                fontSize: '10px',
                color: colors.muted,
                whiteSpace: 'nowrap',
                marginLeft: '16px',
              }}>
                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
              </span>
            </div>
            <div style={{
              fontSize: '12px',
              color: colors.primary,
              fontWeight: 500,
              marginBottom: '8px',
            }}>
              {exp.company}
            </div>
            {exp.description && exp.description.length > 0 && (
              <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px', listStyleType: 'disc' }}>
                {exp.description.map((desc: string, i: number) => (
                  <li key={i} style={{
                    fontSize: '11px',
                    color: colors.text,
                    lineHeight: 1.6,
                    marginBottom: '4px',
                  }}>
                    {desc}
                  </li>
                ))}
              </ul>
            )}
            {skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {skills.map((skill, i) => (
                  <span key={i} style={{
                    fontSize: '8px',
                    color: colors.primary,
                    backgroundColor: `${colors.primary}15`,
                    padding: '3px 8px',
                    borderRadius: '10px',
                    fontWeight: 600,
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
