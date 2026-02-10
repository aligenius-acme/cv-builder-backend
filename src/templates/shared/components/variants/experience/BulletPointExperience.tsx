import * as React from 'react';
import { ExperienceEntry } from '../../../../../types';

export interface BulletPointExperienceProps {
  experiences: ExperienceEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const BulletPointExperience: React.FC<BulletPointExperienceProps> = ({ experiences, colors }) => {
  return (
    <div>
      {experiences.map((exp, index) => (
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
            {exp.company}{exp.location && ` • ${exp.location}`}
          </div>

          {exp.description && exp.description.length > 0 && (
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              listStyleType: 'disc',
            }}>
              {exp.description.map((desc, i) => (
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
      ))}
    </div>
  );
};
