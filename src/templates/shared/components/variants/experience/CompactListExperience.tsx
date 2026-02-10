import * as React from 'react';
import { ExperienceEntry } from '../../../../../types';

export interface CompactListExperienceProps {
  experiences: ExperienceEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const CompactListExperience: React.FC<CompactListExperienceProps> = ({ experiences, colors }) => {
  return (
    <div>
      {experiences.map((exp, index) => (
        <div key={index} style={{
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: index < experiences.length - 1 ? `1px solid ${colors.muted}20` : 'none',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
            <h3 style={{
              fontSize: '13px',
              color: colors.text,
              fontWeight: 600,
              margin: 0,
            }}>
              {exp.title} • {exp.company}
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
          {exp.description && exp.description.length > 0 && (
            <div style={{
              fontSize: '10px',
              color: colors.text,
              lineHeight: 1.6,
            }}>
              {exp.description.join(' • ')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
