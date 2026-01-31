/**
 * ExperienceSection Component
 * Displays work experience entries with job details and achievements
 */

import React from 'react';
import { ExperienceEntry } from '../../../types';
import { ColorPalette } from '../styles/colors';
import { textStyles } from '../styles/typography';
import { formatDateRange, calculateDuration } from '../utils/formatters';
import { ensureBulletPoint } from '../utils/formatters';

export interface ExperienceSectionProps {
  experiences: ExperienceEntry[];
  colors: ColorPalette;
  showDuration?: boolean;
  bulletStyle?: 'bullet' | 'dash' | 'none';
  layout?: 'default' | 'compact' | 'detailed';
}

/**
 * Single experience entry component
 */
export const ExperienceItem: React.FC<{
  experience: ExperienceEntry;
  colors: ColorPalette;
  showDuration?: boolean;
  bulletStyle?: 'bullet' | 'dash' | 'none';
  layout?: 'default' | 'compact' | 'detailed';
}> = ({
  experience,
  colors,
  showDuration = false,
  bulletStyle = 'bullet',
  layout = 'default',
}) => {
  const dateRange = formatDateRange(
    experience.startDate,
    experience.endDate,
    experience.current
  );

  const duration = showDuration
    ? calculateDuration(experience.startDate, experience.endDate, experience.current)
    : '';

  const location = experience.location;

  const getBulletChar = () => {
    switch (bulletStyle) {
      case 'dash':
        return '-';
      case 'none':
        return '';
      default:
        return '•';
    }
  };

  if (layout === 'compact') {
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <span style={{ ...textStyles.subtitle, color: colors.text, fontWeight: 600 }}>
              {experience.title}
            </span>
            {experience.company && (
              <span style={{ ...textStyles.body, color: colors.textLight }}>
                {' '}at {experience.company}
              </span>
            )}
          </div>
          {dateRange && (
            <span style={{ ...textStyles.bodySmall, color: colors.textMuted }}>
              {dateRange}
            </span>
          )}
        </div>

        {experience.description && experience.description.length > 0 && (
          <ul style={{ margin: '4px 0', paddingLeft: 20, listStyleType: 'none' }}>
            {experience.description.map((item, index) => (
              <li
                key={index}
                style={{
                  ...textStyles.bodySmall,
                  color: colors.textLight,
                  marginBottom: 2,
                }}
              >
                {bulletStyle !== 'none' && `${getBulletChar()} `}
                {ensureBulletPoint(item, '')}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (layout === 'detailed') {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 6 }}>
          <h3
            style={{
              ...textStyles.h4,
              color: colors.text,
              fontWeight: 700,
              margin: 0,
            }}
          >
            {experience.title}
          </h3>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <div>
            <div style={{ ...textStyles.body, color: colors.textLight, fontWeight: 600 }}>
              {experience.company}
            </div>
            {location && (
              <div style={{ ...textStyles.bodySmall, color: colors.textMuted }}>
                {location}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            {dateRange && (
              <div style={{ ...textStyles.body, color: colors.textLight }}>
                {dateRange}
              </div>
            )}
            {duration && (
              <div style={{ ...textStyles.bodySmall, color: colors.textMuted }}>
                {duration}
              </div>
            )}
          </div>
        </div>

        {experience.description && experience.description.length > 0 && (
          <ul style={{ margin: '6px 0', paddingLeft: 20, listStyleType: 'none' }}>
            {experience.description.map((item, index) => (
              <li
                key={index}
                style={{
                  ...textStyles.body,
                  color: colors.textLight,
                  marginBottom: 4,
                  lineHeight: 1.6,
                }}
              >
                {bulletStyle !== 'none' && `${getBulletChar()} `}
                {ensureBulletPoint(item, '')}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Default layout
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <div style={{ ...textStyles.subtitle, color: colors.text, fontWeight: 700 }}>
            {experience.title}
          </div>
          {experience.company && (
            <div style={{ ...textStyles.body, color: colors.textLight, fontWeight: 600 }}>
              {experience.company}
              {location && ` • ${location}`}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          {dateRange && (
            <div style={{ ...textStyles.body, color: colors.textLight }}>
              {dateRange}
            </div>
          )}
          {duration && (
            <div style={{ ...textStyles.bodySmall, color: colors.textMuted }}>
              {duration}
            </div>
          )}
        </div>
      </div>

      {experience.description && experience.description.length > 0 && (
        <ul style={{ margin: '6px 0', paddingLeft: 20, listStyleType: 'none' }}>
          {experience.description.map((item, index) => (
            <li
              key={index}
              style={{
                ...textStyles.body,
                color: colors.textLight,
                marginBottom: 3,
                lineHeight: 1.5,
              }}
            >
              {bulletStyle !== 'none' && `${getBulletChar()} `}
              {ensureBulletPoint(item, '')}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Experience section container
 */
export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experiences,
  colors,
  showDuration = false,
  bulletStyle = 'bullet',
  layout = 'default',
}) => {
  if (!experiences || experiences.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {experiences.map((experience, index) => (
        <ExperienceItem
          key={index}
          experience={experience}
          colors={colors}
          showDuration={showDuration}
          bulletStyle={bulletStyle}
          layout={layout}
        />
      ))}
    </div>
  );
};

export default ExperienceSection;
