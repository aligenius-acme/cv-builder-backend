/**
 * CertificationsSection Component
 * Displays certifications and licenses
 */

import React from 'react';
import { CertificationEntry } from '../../../types';
import { ColorPalette } from '../styles/colors';
import { textStyles } from '../styles/typography';
import { formatDate } from '../utils/formatters';

export interface CertificationsSectionProps {
  certifications: CertificationEntry[];
  colors: ColorPalette;
  layout?: 'default' | 'compact' | 'detailed' | 'list';
}

/**
 * Single certification entry component
 */
export const CertificationItem: React.FC<{
  certification: CertificationEntry;
  colors: ColorPalette;
  layout?: 'default' | 'compact' | 'detailed' | 'list';
}> = ({ certification, colors, layout = 'default' }) => {
  const date = formatDate(certification.date);

  if (layout === 'list') {
    return (
      <li
        style={{
          ...textStyles.body,
          color: colors.textLight,
          marginBottom: 4,
        }}
      >
        <span style={{ fontWeight: 600 }}>{certification.name}</span>
        {certification.issuer && <span> • {certification.issuer}</span>}
        {date && <span style={{ color: colors.textMuted }}> • {date}</span>}
      </li>
    );
  }

  if (layout === 'compact') {
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <span style={{ ...textStyles.body, color: colors.text, fontWeight: 600 }}>
              {certification.name}
            </span>
            {certification.issuer && (
              <span style={{ ...textStyles.bodySmall, color: colors.textLight }}>
                {' '}• {certification.issuer}
              </span>
            )}
          </div>
          {date && (
            <span style={{ ...textStyles.bodySmall, color: colors.textMuted }}>
              {date}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (layout === 'detailed') {
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 2 }}>
          <h3
            style={{
              ...textStyles.h4,
              color: colors.text,
              fontWeight: 700,
              margin: 0,
            }}
          >
            {certification.name}
          </h3>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {certification.issuer && (
            <div style={{ ...textStyles.body, color: colors.textLight, fontWeight: 600 }}>
              {certification.issuer}
            </div>
          )}
          {date && (
            <div style={{ ...textStyles.body, color: colors.textMuted }}>
              {date}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default layout
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ ...textStyles.subtitle, color: colors.text, fontWeight: 700 }}>
            {certification.name}
          </div>
          {certification.issuer && (
            <div style={{ ...textStyles.body, color: colors.textLight }}>
              {certification.issuer}
            </div>
          )}
        </div>

        {date && (
          <div style={{ ...textStyles.body, color: colors.textMuted }}>
            {date}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Certifications section container
 */
export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  certifications,
  colors,
  layout = 'default',
}) => {
  if (!certifications || certifications.length === 0) {
    return null;
  }

  if (layout === 'list') {
    return (
      <ul
        style={{
          margin: '0 0 16px 0',
          paddingLeft: 20,
          listStyleType: 'disc',
        }}
      >
        {certifications.map((cert, index) => (
          <CertificationItem
            key={index}
            certification={cert}
            colors={colors}
            layout={layout}
          />
        ))}
      </ul>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {certifications.map((cert, index) => (
        <CertificationItem
          key={index}
          certification={cert}
          colors={colors}
          layout={layout}
        />
      ))}
    </div>
  );
};

export default CertificationsSection;
