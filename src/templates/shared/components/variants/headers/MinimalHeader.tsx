import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface MinimalHeaderProps {
  contact: ContactInfo;
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
  photoUrl?: string;
}

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({ contact, colors, photoUrl }) => {
  return (
    <div style={{
      textAlign: 'center',
      paddingBottom: '24px',
      borderBottom: `1px solid ${colors.muted}20`,
      marginBottom: '32px',
    }}>
      {photoUrl && (
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          overflow: 'hidden',
          margin: '0 auto 16px',
          border: `2px solid ${colors.primary}`,
        }}>
          <img src={photoUrl} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <h1 style={{
        fontSize: '28px',
        color: colors.text,
        margin: '0 0 8px 0',
        fontWeight: 300,
        letterSpacing: '1px',
      }}>
        {contact.name}
      </h1>

      <div style={{
        fontSize: '11px',
        color: colors.muted,
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {contact.email && <span>{contact.email}</span>}
        {contact.phone && <span>{contact.phone}</span>}
        {contact.location && <span>{contact.location}</span>}
        {contact.linkedin && <span>{contact.linkedin}</span>}
        {contact.github && <span>{contact.github}</span>}
        {contact.website && <span>{contact.website}</span>}
      </div>
    </div>
  );
};
