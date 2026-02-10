import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface TwoColumnHeaderProps {
  contact: ContactInfo;
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
  photoUrl?: string;
}

export const TwoColumnHeader: React.FC<TwoColumnHeaderProps> = ({ contact, colors, photoUrl }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '32px',
      paddingBottom: '20px',
      borderBottom: `1px solid ${colors.muted}30`,
      marginBottom: '28px',
    }}>
      <div style={{ flex: 1 }}>
        <h1 style={{
          fontSize: '32px',
          color: colors.text,
          margin: '0 0 8px 0',
          fontWeight: 600,
        }}>
          {contact.name}
        </h1>
        {contact.email && (
          <div style={{ fontSize: '11px', color: colors.text, marginBottom: '4px' }}>
            📧 {contact.email}
          </div>
        )}
        {contact.phone && (
          <div style={{ fontSize: '11px', color: colors.text, marginBottom: '4px' }}>
            📱 {contact.phone}
          </div>
        )}
        {contact.location && (
          <div style={{ fontSize: '11px', color: colors.text, marginBottom: '4px' }}>
            📍 {contact.location}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'right' }}>
        {photoUrl && (
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '12px',
            border: `2px solid ${colors.primary}`,
          }}>
            <img src={photoUrl} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        {contact.linkedin && (
          <div style={{ fontSize: '10px', color: colors.primary, marginBottom: '4px' }}>
            {contact.linkedin}
          </div>
        )}
        {contact.github && (
          <div style={{ fontSize: '10px', color: colors.primary, marginBottom: '4px' }}>
            {contact.github}
          </div>
        )}
        {contact.website && (
          <div style={{ fontSize: '10px', color: colors.primary }}>
            {contact.website}
          </div>
        )}
      </div>
    </div>
  );
};
