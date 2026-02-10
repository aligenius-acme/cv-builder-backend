import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface ExecutiveSignatureHeaderProps {
  contact: ContactInfo;
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
  photoUrl?: string;
}

export const ExecutiveSignatureHeader: React.FC<ExecutiveSignatureHeaderProps> = ({ contact, colors, photoUrl }) => {
  return (
    <div style={{ marginBottom: '36px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '24px',
        marginBottom: '20px',
      }}>
        <div>
          <h1 style={{
            fontSize: '42px',
            color: colors.text,
            margin: 0,
            fontWeight: 300,
            fontFamily: 'Georgia, Times, serif',
            letterSpacing: '-1px',
          }}>
            {contact.name}
          </h1>
          <div style={{
            width: '100px',
            height: '2px',
            backgroundColor: colors.primary,
            marginTop: '12px',
          }} />
        </div>

        {photoUrl && (
          <div style={{
            width: '95px',
            height: '95px',
            borderRadius: '4px',
            overflow: 'hidden',
            border: `3px solid ${colors.primary}`,
            flexShrink: 0,
          }}>
            <img src={photoUrl} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        fontSize: '10px',
        color: colors.muted,
        fontFamily: 'Georgia, Times, serif',
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
