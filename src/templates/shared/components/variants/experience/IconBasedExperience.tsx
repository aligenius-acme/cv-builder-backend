import * as React from 'react';
import { ExperienceEntry } from '../../../../../types';

export interface IconBasedExperienceProps {
  experiences: ExperienceEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const IconBasedExperience: React.FC<IconBasedExperienceProps> = ({ experiences, colors }) => {
  return (
    <div>
      {experiences.map((exp, index) => (
        <div key={index} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: `${colors.primary}15`,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 700,
            color: colors.primary,
          }}>
            💼
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '14px',
              color: colors.text,
              fontWeight: 600,
              margin: '0 0 2px 0',
            }}>
              {exp.title}
            </h3>
            <div style={{
              fontSize: '12px',
              color: colors.primary,
              fontWeight: 500,
              marginBottom: '6px',
            }}>
              {exp.company} • {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
            </div>
            {exp.description && exp.description.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
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
