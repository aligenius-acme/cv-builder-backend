/**
 * SectionHeader Component
 * Reusable section header with consistent styling
 */

import React from 'react';
import { ColorPalette } from '../styles/colors';
import { textStyles } from '../styles/typography';

export interface SectionHeaderProps {
  title: string;
  colors: ColorPalette;
  variant?: 'default' | 'underline' | 'filled' | 'minimal' | 'sidebar' | 'boxed';
  icon?: string;
  uppercase?: boolean;
}

/**
 * SectionHeader component for resume sections
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  colors,
  variant = 'default',
  icon,
  uppercase = false,
}) => {
  const displayTitle = uppercase ? title.toUpperCase() : title;

  if (variant === 'underline') {
    return (
      <div
        style={{
          marginBottom: 12,
          paddingBottom: 6,
          borderBottom: `2px solid ${colors.primary}`,
        }}
      >
        <h2
          style={{
            ...textStyles.h3,
            color: colors.primary,
            fontWeight: 700,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {icon && <span>{icon}</span>}
          {displayTitle}
        </h2>
      </div>
    );
  }

  if (variant === 'filled') {
    return (
      <div
        style={{
          marginBottom: 12,
          padding: '8px 12px',
          backgroundColor: colors.primary,
          color: '#ffffff',
        }}
      >
        <h2
          style={{
            ...textStyles.h3,
            fontWeight: 700,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {icon && <span>{icon}</span>}
          {displayTitle}
        </h2>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div style={{ marginBottom: 8 }}>
        <h2
          style={{
            ...textStyles.h4,
            color: colors.text,
            fontWeight: 700,
            margin: 0,
            textTransform: uppercase ? 'uppercase' : 'none',
            letterSpacing: uppercase ? '0.5px' : 'normal',
          }}
        >
          {displayTitle}
        </h2>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div
        style={{
          marginBottom: 12,
          paddingLeft: 12,
          borderLeft: `4px solid ${colors.primary}`,
        }}
      >
        <h2
          style={{
            ...textStyles.h3,
            color: colors.primary,
            fontWeight: 700,
            margin: 0,
          }}
        >
          {displayTitle}
        </h2>
      </div>
    );
  }

  if (variant === 'boxed') {
    return (
      <div
        style={{
          marginBottom: 12,
          padding: '6px 12px',
          border: `2px solid ${colors.primary}`,
          backgroundColor: colors.backgroundAlt,
        }}
      >
        <h2
          style={{
            ...textStyles.h3,
            color: colors.primary,
            fontWeight: 700,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {icon && <span>{icon}</span>}
          {displayTitle}
        </h2>
      </div>
    );
  }

  // Default variant
  return (
    <div style={{ marginBottom: 12 }}>
      <h2
        style={{
          ...textStyles.h3,
          color: colors.primary,
          fontWeight: 700,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {icon && <span>{icon}</span>}
        {displayTitle}
      </h2>
    </div>
  );
};

/**
 * Subsection header (smaller than main section)
 */
export const SubsectionHeader: React.FC<{
  title: string;
  colors: ColorPalette;
}> = ({ title, colors }) => {
  return (
    <h3
      style={{
        ...textStyles.h4,
        color: colors.textLight,
        fontWeight: 600,
        margin: '8px 0 4px 0',
      }}
    >
      {title}
    </h3>
  );
};

/**
 * Divider for sections
 */
export const SectionDivider: React.FC<{
  colors: ColorPalette;
  spacing?: number;
}> = ({ colors, spacing = 16 }) => {
  return (
    <div
      style={{
        height: '1px',
        backgroundColor: colors.borderLight,
        margin: `${spacing}px 0`,
      }}
    />
  );
};

export default SectionHeader;
