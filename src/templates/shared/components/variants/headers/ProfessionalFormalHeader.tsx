import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface ProfessionalFormalHeaderProps {
  contact: ContactInfo;
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
  photoUrl?: string;
}

export const ProfessionalFormalHeader: React.FC<ProfessionalFormalHeaderProps> = ({ contact, colors, photoUrl }) => {
  return (
    <div style={{
      marginBottom: '32px',
      borderBottom: `2px solid ${colors.primary}`,
      paddingBottom: '16px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '24px',
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '32px',
            color: colors.primary,
            margin: '0 0 4px 0',
            fontWeight: 700,
            fontFamily: 'Georgia, Times, serif',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}>
            {contact.name}
          </h1>

          <div style={{
            fontSize: '10px',
            color: colors.text,
            marginTop: '12px',
            lineHeight: '1.8',
          }}>
            {contact.email && <div>{contact.email}</div>}
            {contact.phone && <div>{contact.phone}</div>}
            {contact.location && <div>{contact.location}</div>}
            {contact.linkedin && <div>{contact.linkedin}</div>}
            {contact.github && <div>{contact.github}</div>}
            {contact.website && <div>{contact.website}</div>}
          </div>
        </div>

        {photoUrl && (
          <div style={{
            width: '100px',
            height: '100px',
            overflow: 'hidden',
            border: `3px solid ${colors.primary}`,
            flexShrink: 0,
          }}>
            <img src={photoUrl} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </div>
    </div>
  );
};
