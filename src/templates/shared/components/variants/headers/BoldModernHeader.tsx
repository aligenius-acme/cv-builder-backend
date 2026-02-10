import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface BoldModernHeaderProps {
  contact: ContactInfo;
  colors: {
    primary: string;
    text: string;
    muted: string;
    background: string;
  };
  photoUrl?: string;
}

export const BoldModernHeader: React.FC<BoldModernHeaderProps> = ({ contact, colors, photoUrl }) => {
  return (
    <div style={{
      backgroundColor: colors.primary,
      padding: '40px',
      marginTop: '-40px',
      marginLeft: '-40px',
      marginRight: '-40px',
      marginBottom: '32px',
      position: 'relative',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
      }}>
        {photoUrl && (
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: `4px solid ${colors.background}`,
            flexShrink: 0,
          }}>
            <img src={photoUrl} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '42px',
            color: colors.background,
            margin: '0 0 12px 0',
            fontWeight: 700,
            letterSpacing: '-1px',
          }}>
            {contact.name}
          </h1>

          <div style={{
            fontSize: '13px',
            color: colors.background,
            opacity: 0.9,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            {contact.email && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                ✉ {contact.email}
              </span>
            )}
            {contact.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                ☎ {contact.phone}
              </span>
            )}
            {contact.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                📍 {contact.location}
              </span>
            )}
            {contact.linkedin && <span>🔗 {contact.linkedin}</span>}
            {contact.github && <span>💻 {contact.github}</span>}
            {contact.website && <span>🌐 {contact.website}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
