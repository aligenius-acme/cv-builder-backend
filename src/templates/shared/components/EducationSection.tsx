/**
 * EducationSection Component
 * Displays education entries with degree, institution, and achievements
 */

import React from 'react';
import { EducationEntry } from '../../../types';
import { ColorPalette } from '../styles/colors';
import { textStyles } from '../styles/typography';
import { formatDate, formatGPA } from '../utils/formatters';

export interface EducationSectionProps {
  education: EducationEntry[];
  colors: ColorPalette;
  showGPA?: boolean;
  layout?: 'default' | 'compact' | 'detailed';
}

/**
 * Single education entry component
 */
export const EducationItem: React.FC<{
  entry: EducationEntry;
  colors: ColorPalette;
  showGPA?: boolean;
  layout?: 'default' | 'compact' | 'detailed';
}> = ({ entry, colors, showGPA = true, layout = 'default' }) => {
  const graduationDate = formatDate(entry.graduationDate);
  const gpa = showGPA && entry.gpa ? formatGPA(entry.gpa) : null;

  if (layout === 'compact') {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <div>
            <span style={{ ...textStyles.body, color: colors.text, fontWeight: 600 }}>
              {entry.degree}
            </span>
            {entry.institution && (
              <span style={{ ...textStyles.bodySmall, color: colors.textLight }}>
                {' '}• {entry.institution}
              </span>
            )}
          </div>
          {graduationDate && (
            <span style={{ ...textStyles.bodySmall, color: colors.textMuted }}>
              {graduationDate}
            </span>
          )}
        </div>

        {(gpa || entry.location) && (
          <div style={{ ...textStyles.bodySmall, color: colors.textMuted }}>
            {gpa && <span>{gpa}</span>}
            {gpa && entry.location && <span> • </span>}
            {entry.location && <span>{entry.location}</span>}
          </div>
        )}
      </div>
    );
  }

  if (layout === 'detailed') {
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ marginBottom: 4 }}>
          <h3
            style={{
              ...textStyles.h4,
              color: colors.text,
              fontWeight: 700,
              margin: 0,
            }}
          >
            {entry.degree}
          </h3>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <div>
            <div style={{ ...textStyles.body, color: colors.textLight, fontWeight: 600 }}>
              {entry.institution}
            </div>
            {entry.location && (
              <div style={{ ...textStyles.bodySmall, color: colors.textMuted }}>
                {entry.location}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            {graduationDate && (
              <div style={{ ...textStyles.body, color: colors.textLight }}>
                {graduationDate}
              </div>
            )}
            {gpa && (
              <div style={{ ...textStyles.bodySmall, color: colors.textMuted }}>
                {gpa}
              </div>
            )}
          </div>
        </div>

        {entry.achievements && entry.achievements.length > 0 && (
          <ul style={{ margin: '4px 0', paddingLeft: 20, listStyleType: 'none' }}>
            {entry.achievements.map((achievement, index) => (
              <li
                key={index}
                style={{
                  ...textStyles.bodySmall,
                  color: colors.textLight,
                  marginBottom: 2,
                }}
              >
                • {achievement}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Default layout
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <div>
          <div style={{ ...textStyles.subtitle, color: colors.text, fontWeight: 700 }}>
            {entry.degree}
          </div>
          {entry.institution && (
            <div style={{ ...textStyles.body, color: colors.textLight, fontWeight: 600 }}>
              {entry.institution}
              {entry.location && ` • ${entry.location}`}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          {graduationDate && (
            <div style={{ ...textStyles.body, color: colors.textLight }}>
              {graduationDate}
            </div>
          )}
        </div>
      </div>

      {gpa && (
        <div style={{ ...textStyles.bodySmall, color: colors.textMuted, marginTop: 2 }}>
          {gpa}
        </div>
      )}

      {entry.achievements && entry.achievements.length > 0 && (
        <ul style={{ margin: '4px 0', paddingLeft: 20, listStyleType: 'none' }}>
          {entry.achievements.map((achievement, index) => (
            <li
              key={index}
              style={{
                ...textStyles.bodySmall,
                color: colors.textLight,
                marginBottom: 2,
              }}
            >
              • {achievement}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Education section container
 */
export const EducationSection: React.FC<EducationSectionProps> = ({
  education,
  colors,
  showGPA = true,
  layout = 'default',
}) => {
  if (!education || education.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {education.map((entry, index) => (
        <EducationItem
          key={index}
          entry={entry}
          colors={colors}
          showGPA={showGPA}
          layout={layout}
        />
      ))}
    </div>
  );
};

export default EducationSection;
