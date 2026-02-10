import * as React from 'react';
import { ExperienceEntry } from '../../../../../types';

export interface CardLayoutExperienceProps {
  experiences: ExperienceEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const CardLayoutExperience: React.FC<CardLayoutExperienceProps> = ({ experiences, colors }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
      {experiences.map((exp, index) => (
        <div key={index} style={{
          backgroundColor: `${colors.primary}06`,
          border: `1px solid ${colors.primary}20`,
          borderRadius: '8px',
          padding: '16px',
        }}>
          <h3 style={{
            fontSize: '13px',
            color: colors.primary,
            fontWeight: 700,
            margin: '0 0 4px 0',
          }}>
            {exp.title}
          </h3>
          <div style={{
            fontSize: '11px',
            color: colors.text,
            fontWeight: 600,
            marginBottom: '4px',
          }}>
            {exp.company}
          </div>
          <div style={{
            fontSize: '9px',
            color: colors.muted,
            marginBottom: '12px',
          }}>
            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
          </div>
          {exp.description && exp.description.length > 0 && (
            <ul style={{
              margin: 0,
              paddingLeft: '16px',
              listStyleType: 'disc',
            }}>
              {exp.description.slice(0, 2).map((desc: string, i: number) => (
                <li key={i} style={{
                  fontSize: '9px',
                  color: colors.text,
                  lineHeight: 1.5,
                  marginBottom: '3px',
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
