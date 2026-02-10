import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface CompactSingleLineHeaderProps {
  contact: ContactInfo;
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
  photoUrl?: string;
}

export const CompactSingleLineHeader: React.FC<CompactSingleLineHeaderProps> = ({ contact, colors, photoUrl }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '16px',
      borderBottom: `2px solid ${colors.primary}`,
      marginBottom: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {photoUrl && (
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: `2px solid ${colors.primary}`,
            flexShrink: 0,
          }}>
            <img src={photoUrl} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <h1 style={{
          fontSize: '24px',
          color: colors.text,
          margin: 0,
          fontWeight: 700,
        }}>
          {contact.name}
        </h1>
      </div>

      <div style={{
        fontSize: '9px',
        color: colors.muted,
        textAlign: 'right',
        lineHeight: 1.8,
      }}>
        {contact.email && <div>{contact.email}</div>}
        {contact.phone && <div>{contact.phone}</div>}
        {contact.location && <div>{contact.location}</div>}
      </div>
    </div>
  );
};
