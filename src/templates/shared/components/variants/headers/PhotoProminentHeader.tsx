import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface PhotoProminentHeaderProps {
  contact: ContactInfo;
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
  photoUrl?: string;
}

export const PhotoProminentHeader: React.FC<PhotoProminentHeaderProps> = ({ contact, colors, photoUrl }) => {
  return (
    <div style={{
      textAlign: 'center',
      marginBottom: '32px',
    }}>
      {photoUrl && (
        <div style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          overflow: 'hidden',
          margin: '0 auto 20px',
          border: `5px solid ${colors.primary}`,
          boxShadow: `0 0 0 8px ${colors.primary}20`,
        }}>
          <img src={photoUrl} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <h1 style={{
        fontSize: '34px',
        color: colors.text,
        margin: '0 0 8px 0',
        fontWeight: 700,
        letterSpacing: '-0.5px',
      }}>
        {contact.name}
      </h1>

      <div style={{
        width: '80px',
        height: '3px',
        backgroundColor: colors.primary,
        margin: '0 auto 16px',
      }} />

      <div style={{
        fontSize: '11px',
        color: colors.muted,
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        {contact.email && <span>{contact.email}</span>}
        {contact.phone && <span>{contact.phone}</span>}
        {contact.location && <span>{contact.location}</span>}
      </div>

      {(contact.linkedin || contact.github || contact.website) && (
        <div style={{
          fontSize: '10px',
          color: colors.primary,
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '8px',
        }}>
          {contact.linkedin && <span>🔗 {contact.linkedin}</span>}
          {contact.github && <span>💻 {contact.github}</span>}
          {contact.website && <span>🌐 {contact.website}</span>}
        </div>
      )}
    </div>
  );
};
