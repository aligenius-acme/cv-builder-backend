import * as React from 'react';
import { ExperienceEntry } from '../../../../../types';

export interface AchievementBoxesExperienceProps {
  experiences: ExperienceEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const AchievementBoxesExperience: React.FC<AchievementBoxesExperienceProps> = ({ experiences, colors }) => {
  return (
    <div>
      {experiences.map((exp, index) => (
        <div key={index} style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '12px',
          }}>
            <div>
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
                {exp.company}{exp.location && ` • ${exp.location}`}
              </div>
            </div>
            <div style={{
              fontSize: '10px',
              color: colors.muted,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              marginLeft: '16px',
            }}>
              {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
            </div>
          </div>

          {exp.description && exp.description.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
            }}>
              {exp.description.map((desc: string, i: number) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: `${colors.primary}06`,
                    border: `1px solid ${colors.primary}30`,
                    borderRadius: '6px',
                    padding: '10px',
                    fontSize: '10px',
                    color: colors.text,
                    lineHeight: 1.5,
                  }}
                >
                  {desc}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
