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
 * Shows circular profile photo or initials fallback
 */
export const PhotoCircle: React.FC<PhotoCircleProps> = ({
  photoUrl,
  name,
  size = 'medium',
  position = 'left',
  primaryColor = '#3b82f6',
}) => {
  // Size mappings
  const sizeMap = {
    small: 80,
    medium: 120,
    large: 150,
  };

  const photoSize = sizeMap[size];

  // Get initials from name (first letter of first and last name)
  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  // Container style based on position
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: position === 'center' ? 'center' : position === 'right' ? 'flex-end' : 'flex-start',
    marginBottom: position === 'center' ? '16px' : '0',
  };

  // Circle style
  const circleStyle: React.CSSProperties = {
    width: `${photoSize}px`,
    height: `${photoSize}px`,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: photoUrl ? 'transparent' : primaryColor,
    color: '#ffffff',
    fontSize: `${photoSize * 0.4}px`,
    fontWeight: 700,
    flexShrink: 0,
  };

  return (
    <div style={containerStyle}>
      <div style={circleStyle}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${name} profile`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    </div>
  );
};
