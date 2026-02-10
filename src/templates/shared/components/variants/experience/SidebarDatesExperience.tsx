import * as React from 'react';
import { ExperienceEntry } from '../../../../../types';

export interface SidebarDatesExperienceProps {
  experiences: ExperienceEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const SidebarDatesExperience: React.FC<SidebarDatesExperienceProps> = ({ experiences, colors }) => {
  return (
    <div>
      {experiences.map((exp, index) => (
        <div key={index} style={{
          display: 'flex',
          gap: '24px',
          marginBottom: '24px',
        }}>
          <div style={{
            width: '90px',
            flexShrink: 0,
            paddingTop: '2px',
          }}>
            <div style={{
              fontSize: '10px',
              color: colors.primary,
              fontWeight: 700,
              backgroundColor: `${colors.primary}10`,
              padding: '6px 8px',
              borderRadius: '4px',
              textAlign: 'center',
            }}>
              {exp.startDate}
              <br />
              {exp.current ? 'Present' : exp.endDate}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '14px',
              color: colors.text,
              fontWeight: 600,
              margin: '0 0 4px 0',
            }}>
              {exp.title}
            </h3>
            <div style={{
              fontSize: '12px',
              color: colors.primary,
              fontWeight: 500,
              marginBottom: '8px',
            }}>
              {exp.company}{exp.location && ` • ${exp.location}`}
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
