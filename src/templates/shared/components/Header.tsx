/**
 * Header Component
 * Resume header with name and contact information
 */

import React from 'react';
import { ContactInfo } from '../../../types';
import { ColorPalette } from '../styles/colors';
import { textStyles } from '../styles/typography';

export interface HeaderProps {
  contact: ContactInfo;
  colors: ColorPalette;
  variant?: 'centered' | 'left' | 'split';
  showLinks?: boolean;
}

/**
 * Header component for PDF rendering
 * Displays candidate name and contact information
 */
export const Header: React.FC<HeaderProps> = ({
  contact,
  colors,
  variant = 'centered',
  showLinks = true,
}) => {
  const name = contact.name || 'Your Name';

  const contactItems = [
    contact.email,
    contact.phone,
    contact.location,
    showLinks && contact.linkedin,
    showLinks && contact.github,
    showLinks && contact.website,
  ].filter(Boolean);

  return (
    <div
      style={{
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: `2px solid ${colors.border}`,
        textAlign: variant === 'centered' ? 'center' : 'left',
      }}
    >
      <h1
        style={{
          ...textStyles.h1,
          color: colors.primary,
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        {name}
      </h1>

      {contactItems.length > 0 && (
        <div
          style={{
            ...textStyles.bodySmall,
            color: colors.textLight,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: variant === 'centered' ? 'center' : 'flex-start',
            gap: '8px',
          }}
        >
          {contactItems.map((item, index) => (
            <React.Fragment key={index}>
              <span>{item}</span>
              {index < contactItems.length - 1 && (
                <span style={{ color: colors.textMuted }}>|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Compact header variant (single line)
 */
export const CompactHeader: React.FC<HeaderProps> = ({
  contact,
  colors,
  showLinks = true,
}) => {
  const name = contact.name || 'Your Name';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 8,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <h1
        style={{
          ...textStyles.h2,
          color: colors.primary,
          margin: 0,
        }}
      >
        {name}
      </h1>

      <div
        style={{
          ...textStyles.bodySmall,
          color: colors.textLight,
          textAlign: 'right',
        }}
      >
        {contact.email && <div>{contact.email}</div>}
        {contact.phone && <div>{contact.phone}</div>}
      </div>
    </div>
  );
};

/**
 * Two-column header variant
 */
export const SplitHeader: React.FC<HeaderProps> = ({
  contact,
  colors,
  showLinks = true,
}) => {
  const name = contact.name || 'Your Name';

  const contactLeft = [contact.email, contact.phone].filter(Boolean);

  const contactRight = [
    contact.location,
    showLinks && contact.linkedin,
    showLinks && contact.github,
  ].filter(Boolean);

  return (
    <div
      style={{
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: `2px solid ${colors.border}`,
      }}
    >
      <h1
        style={{
          ...textStyles.h1,
          color: colors.primary,
          marginBottom: 8,
        }}
      >
        {name}
      </h1>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          ...textStyles.bodySmall,
          color: colors.textLight,
        }}
      >
        <div>
          {contactLeft.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </div>

        <div style={{ textAlign: 'right' }}>
          {contactRight.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Header;
