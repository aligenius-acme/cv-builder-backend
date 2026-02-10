import * as React from 'react';
import { ExperienceEntry } from '../../../../../types';

export interface MetricsFocusedExperienceProps {
  experiences: ExperienceEntry[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

// Helper to detect if a description contains metrics/numbers
const hasMetrics = (text: string): boolean => {
  return /\d+[%$KMB]|\d+\+|\d+x/i.test(text);
};

export const MetricsFocusedExperience: React.FC<MetricsFocusedExperienceProps> = ({ experiences, colors }) => {
  return (
    <div>
      {experiences.map((exp, index) => (
        <div key={index} style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '4px',
            paddingBottom: '8px',
            borderBottom: `2px solid ${colors.primary}20`,
          }}>
            <h3 style={{
              fontSize: '15px',
              color: colors.text,
              fontWeight: 700,
              margin: 0,
            }}>
              {exp.title}
            </h3>
            <span style={{
              fontSize: '10px',
              color: colors.muted,
              whiteSpace: 'nowrap',
              marginLeft: '16px',
              fontWeight: 600,
            }}>
              {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
            </span>
          </div>

          <div style={{
            fontSize: '12px',
            color: colors.primary,
            fontWeight: 600,
            marginBottom: '12px',
          }}>
            {exp.company}{exp.location && ` • ${exp.location}`}
          </div>

          {exp.description && exp.description.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {exp.description.map((desc, i) => {
                const isMetric = hasMetrics(desc);
                return (
                  <div
                    key={i}
                    style={{
                      fontSize: '11px',
                      color: colors.text,
                      lineHeight: 1.6,
                      paddingLeft: isMetric ? '12px' : '20px',
                      borderLeft: isMetric ? `3px solid ${colors.primary}` : 'none',
                      backgroundColor: isMetric ? `${colors.primary}08` : 'transparent',
                      padding: isMetric ? '6px 12px' : '0',
                      fontWeight: isMetric ? 600 : 400,
                    }}
                  >
                    {isMetric ? '📊 ' : '• '}{desc}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
