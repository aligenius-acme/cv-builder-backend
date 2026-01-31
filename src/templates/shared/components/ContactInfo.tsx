/**
 * ContactInfo Component
 * Displays contact information in various layouts
 */

import React from 'react';
import { ContactInfo as ContactInfoType } from '../../../types';
import { ColorPalette } from '../styles/colors';
import { textStyles } from '../styles/typography';
import { formatPhoneNumber, formatUrlForDisplay } from '../utils/formatters';

export interface ContactInfoProps {
  contact: ContactInfoType;
  colors: ColorPalette;
  layout?: 'horizontal' | 'vertical' | 'grid';
  showIcons?: boolean;
  showLabels?: boolean;
}

/**
 * ContactInfo component for displaying contact details
 */
export const ContactInfo: React.FC<ContactInfoProps> = ({
  contact,
  colors,
  layout = 'horizontal',
  showIcons = false,
  showLabels = false,
}) => {
  const items = [
    {
      label: 'Email',
      value: contact.email,
      icon: '✉',
    },
    {
      label: 'Phone',
      value: contact.phone ? formatPhoneNumber(contact.phone) : undefined,
      icon: '☎',
    },
    {
      label: 'Location',
      value: contact.location,
      icon: '📍',
    },
    {
      label: 'LinkedIn',
      value: contact.linkedin ? formatUrlForDisplay(contact.linkedin) : undefined,
      icon: 'in',
    },
    {
      label: 'GitHub',
      value: contact.github ? formatUrlForDisplay(contact.github) : undefined,
      icon: '⚡',
    },
    {
      label: 'Website',
      value: contact.website ? formatUrlForDisplay(contact.website) : undefined,
      icon: '🌐',
    },
  ].filter(item => item.value);

  if (layout === 'horizontal') {
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          ...textStyles.bodySmall,
          color: colors.textLight,
        }}
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {showIcons && <span>{item.icon}</span>}
              {showLabels && <span style={{ fontWeight: 600 }}>{item.label}:</span>}
              <span>{item.value}</span>
            </div>
            {index < items.length - 1 && (
              <span style={{ color: colors.textMuted }}>•</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (layout === 'vertical') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          ...textStyles.bodySmall,
          color: colors.textLight,
        }}
      >
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: '6px' }}>
            {showIcons && (
              <span style={{ width: '16px', textAlign: 'center' }}>{item.icon}</span>
            )}
            {showLabels && <span style={{ fontWeight: 600, width: '80px' }}>{item.label}:</span>}
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    );
  }

  // Grid layout
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        ...textStyles.bodySmall,
        color: colors.textLight,
      }}
    >
      {items.map((item, index) => (
        <div key={index} style={{ display: 'flex', gap: '6px' }}>
          {showIcons && <span>{item.icon}</span>}
          {showLabels && <span style={{ fontWeight: 600 }}>{item.label}:</span>}
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * Minimal contact info (email and phone only)
 */
export const MinimalContactInfo: React.FC<{ contact: ContactInfoType; colors: ColorPalette }> = ({
  contact,
  colors,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        ...textStyles.bodySmall,
        color: colors.textLight,
      }}
    >
      {contact.email && <span>{contact.email}</span>}
      {contact.phone && <span>{formatPhoneNumber(contact.phone)}</span>}
    </div>
  );
};

/**
 * Contact info with links highlighted
 */
export const LinkedContactInfo: React.FC<ContactInfoProps> = ({
  contact,
  colors,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        ...textStyles.bodySmall,
      }}
    >
      <div style={{ color: colors.textLight }}>
        {contact.email && <div>{contact.email}</div>}
        {contact.phone && <div>{formatPhoneNumber(contact.phone)}</div>}
        {contact.location && <div>{contact.location}</div>}
      </div>

      {(contact.linkedin || contact.github || contact.website) && (
        <div
          style={{
            display: 'flex',
            gap: '12px',
            color: colors.primary,
            fontWeight: 500,
          }}
        >
          {contact.linkedin && (
            <div>linkedin.com/in/{formatUrlForDisplay(contact.linkedin)}</div>
          )}
          {contact.github && (
            <div>github.com/{formatUrlForDisplay(contact.github)}</div>
          )}
          {contact.website && <div>{formatUrlForDisplay(contact.website)}</div>}
        </div>
      )}
    </div>
  );
};

export default ContactInfo;
