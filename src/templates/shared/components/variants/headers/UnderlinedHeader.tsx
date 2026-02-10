import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface UnderlinedHeaderProps {
  contact: ContactInfo;
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
  photoUrl?: string;
}

export const UnderlinedHeader: React.FC<UnderlinedHeaderProps> = ({ contact, colors, photoUrl }) => {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '12px',
      }}>
        {photoUrl && (
          <div style={{
            width: '85px',
            height: '85px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: `2px solid ${colors.primary}`,
            flexShrink: 0,
          }}>
            <img src={photoUrl} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '34px',
            color: colors.text,
            margin: 0,
            fontWeight: 600,
            borderBottom: `3px solid ${colors.primary}`,
            paddingBottom: '8px',
            display: 'inline-block',
          }}>
            {contact.name}
          </h1>
        </div>
      </div>

      <div style={{
        fontSize: '11px',
        color: colors.muted,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        marginTop: '16px',
      }}>
        {contact.email && <span>{contact.email}</span>}
        {contact.phone && <span>{contact.phone}</span>}
        {contact.location && <span>{contact.location}</span>}
        {contact.linkedin && <span style={{ color: colors.primary }}>{contact.linkedin}</span>}
        {contact.github && <span style={{ color: colors.primary }}>{contact.github}</span>}
        {contact.website && <span style={{ color: colors.primary }}>{contact.website}</span>}
      </div>
    </div>
  );
};
