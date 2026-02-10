import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface GradientBackgroundHeaderProps {
  contact: ContactInfo;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
  photoUrl?: string;
}

export const GradientBackgroundHeader: React.FC<GradientBackgroundHeaderProps> = ({ contact, colors, photoUrl }) => {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
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
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: `4px solid ${colors.background}`,
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            <img src={photoUrl} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '40px',
            color: colors.background,
            margin: '0 0 12px 0',
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            {contact.name}
          </h1>

          <div style={{
            fontSize: '12px',
            color: colors.background,
            opacity: 0.95,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '8px',
          }}>
            {contact.email && <span>✉ {contact.email}</span>}
            {contact.phone && <span>☎ {contact.phone}</span>}
            {contact.location && <span>📍 {contact.location}</span>}
            {contact.linkedin && <span>🔗 {contact.linkedin}</span>}
            {contact.github && <span>💻 {contact.github}</span>}
            {contact.website && <span>🌐 {contact.website}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
