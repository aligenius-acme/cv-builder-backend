import * as React from 'react';
import { ExperienceEntry } from '../../../../../types';

export interface GridLayoutExperienceProps {
  experiences: ExperienceEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const GridLayoutExperience: React.FC<GridLayoutExperienceProps> = ({ experiences, colors }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
      {experiences.map((exp, index) => (
        <div key={index} style={{
          padding: '16px',
          border: `2px solid ${colors.primary}20`,
          borderRadius: '4px',
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
            marginBottom: '10px',
          }}>
            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
          </div>
          {exp.description && exp.description.length > 0 && (
            <div style={{
              fontSize: '9px',
              color: colors.text,
              lineHeight: 1.5,
            }}>
              {exp.description.slice(0, 2).map((desc: string, i: number) => (
                <div key={i} style={{ marginBottom: '3px' }}>• {desc}</div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
