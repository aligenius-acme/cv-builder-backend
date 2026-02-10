import * as React from 'react';
import { ExperienceEntry } from '../../../../../types';

export interface TimelineLeftExperienceProps {
  experiences: ExperienceEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

export const TimelineLeftExperience: React.FC<TimelineLeftExperienceProps> = ({ experiences, colors }) => {
  return (
    <div style={{ position: 'relative', paddingLeft: '120px' }}>
      {/* Timeline line */}
      <div style={{
        position: 'absolute',
        left: '95px',
        top: '8px',
        bottom: '0',
        width: '2px',
        backgroundColor: `${colors.primary}30`,
      }} />

      {experiences.map((exp, index) => (
        <div key={index} style={{
          marginBottom: '28px',
          position: 'relative',
        }}>
          {/* Timeline dot */}
          <div style={{
            position: 'absolute',
            left: '-28px',
            top: '4px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: colors.primary,
            border: `3px solid #ffffff`,
            boxShadow: `0 0 0 2px ${colors.primary}30`,
          }} />

          {/* Date on left */}
          <div style={{
            position: 'absolute',
            left: '-120px',
            top: '0',
            width: '90px',
            textAlign: 'right',
            fontSize: '10px',
            color: colors.muted,
            fontWeight: 600,
            lineHeight: 1.4,
          }}>
            {exp.startDate}<br />
            {exp.current ? 'Present' : exp.endDate}
          </div>

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
