import * as React from 'react';
import { ExperienceEntry } from '../../../../../types';

export interface TwoColumnExperienceProps {
  experiences: ExperienceEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const TwoColumnExperience: React.FC<TwoColumnExperienceProps> = ({ experiences, colors }) => {
  return (
    <div>
      {experiences.map((exp, index) => (
        <div key={index} style={{
          display: 'grid',
          gridTemplateColumns: '140px 1fr',
          gap: '20px',
          marginBottom: '24px',
        }}>
          <div style={{ textAlign: 'right', paddingTop: '2px' }}>
            <div style={{
              fontSize: '10px',
              color: colors.muted,
              fontWeight: 600,
              marginBottom: '4px',
            }}>
              {exp.startDate}
            </div>
            <div style={{
              fontSize: '10px',
              color: colors.muted,
              fontWeight: 600,
            }}>
              {exp.current ? 'Present' : exp.endDate}
            </div>
          </div>

          <div>
            <h3 style={{
              fontSize: '14px',
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
              marginBottom: '8px',
            }}>
              {exp.company}{exp.location && ` • ${exp.location}`}
            </div>
            {exp.description && exp.description.length > 0 && (
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                listStyleType: 'disc',
              }}>
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
          </div>
        </div>
      ))}
    </div>
  );
};
