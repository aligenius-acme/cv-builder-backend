import * as React from 'react';

export interface PhotoCircleProps {
  photoUrl?: string;
  name: string;
  size?: 'small' | 'medium' | 'large';
  position?: 'left' | 'right' | 'center';
  primaryColor?: string;
}

/**
 * Reusable photo component for resume templates
 * Shows circular profile photo or initials fallback.
 *
 * Uses CSS background-image instead of <img> + objectFit so that both
 * JPEG/PNG data URIs (real user photos) and SVG data URIs (thumbnail
 * placeholders) render reliably in Puppeteer/Chromium.
 */
export const PhotoCircle: React.FC<PhotoCircleProps> = ({
  photoUrl,
  name,
  size = 'medium',
  position = 'left',
  primaryColor = '#3b82f6',
}) => {
  const sizeMap = { small: 80, medium: 120, large: 150 };
  const photoSize = sizeMap[size];

  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: position === 'center' ? 'center' : position === 'right' ? 'flex-end' : 'flex-start',
    marginBottom: position === 'center' ? '16px' : '0',
  };

  const circleStyle: React.CSSProperties = {
    width: `${photoSize}px`,
    height: `${photoSize}px`,
    borderRadius: '50%',
    flexShrink: 0,
    ...(photoUrl ? {
      // CSS background-image renders both JPEG/PNG and SVG data URIs
      // reliably in Puppeteer, unlike <img> + objectFit: cover on SVGs.
      backgroundImage: `url('${photoUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    } : {
      backgroundColor: primaryColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: `${photoSize * 0.4}px`,
      fontWeight: 700,
    }),
  };

  return (
    <div style={containerStyle}>
      <div style={circleStyle}>
        {!photoUrl && <span>{getInitials(name)}</span>}
      </div>
    </div>
  );
};
