import * as React from 'react';
import { ExperienceEntry } from '../../../../../types';

export interface ProjectHighlightExperienceProps {
  experiences: ExperienceEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const ProjectHighlightExperience: React.FC<ProjectHighlightExperienceProps> = ({ experiences, colors }) => {
  return (
    <div>
      {experiences.map((exp, index) => (
        <div key={index} style={{
          marginBottom: '28px',
          borderLeft: `4px solid ${colors.primary}`,
          paddingLeft: '16px',
        }}>
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{
              fontSize: '15px',
              color: colors.text,
              fontWeight: 700,
              margin: '0 0 4px 0',
            }}>
              {exp.title}
            </h3>
            <div style={{
              fontSize: '12px',
              color: colors.primary,
              fontWeight: 600,
            }}>
              {exp.company}
            </div>
            <div style={{
              fontSize: '10px',
              color: colors.muted,
              marginTop: '4px',
            }}>
              {exp.startDate} - {exp.current ? 'Present' : exp.endDate}{exp.location && ` • ${exp.location}`}
            </div>
          </div>
          {exp.description && exp.description.length > 0 && (
            <div>
              <div style={{
                fontSize: '10px',
                color: colors.primary,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
              }}>
                Key Achievements
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'square' }}>
                {exp.description.map((desc: string, i: number) => (
                  <li key={i} style={{
                    fontSize: '11px',
                    color: colors.text,
                    lineHeight: 1.6,
                    marginBottom: '6px',
                  }}>
                    {desc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
