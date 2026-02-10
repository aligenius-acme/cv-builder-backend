import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface SplitLayoutHeaderProps {
  contact: ContactInfo;
  colors: {
    primary: string;
    text: string;
    muted: string;
    background: string;
  };
  photoUrl?: string;
}

export const SplitLayoutHeader: React.FC<SplitLayoutHeaderProps> = ({ contact, colors, photoUrl }) => {
  return (
    <div style={{
      display: 'flex',
      marginTop: '-40px',
      marginLeft: '-40px',
      marginRight: '-40px',
      marginBottom: '32px',
    }}>
      <div style={{
        width: '40%',
        backgroundColor: colors.primary,
        padding: '40px 30px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {photoUrl && (
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: `4px solid ${colors.background}`,
            marginBottom: '16px',
          }}>
            <img src={photoUrl} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <h1 style={{
          fontSize: '28px',
          color: colors.background,
          margin: 0,
          fontWeight: 700,
          textAlign: 'center',
        }}>
          {contact.name}
        </h1>
      </div>

      <div style={{
        flex: 1,
        backgroundColor: `${colors.primary}10`,
        padding: '40px 30px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontSize: '11px',
        color: colors.text,
        lineHeight: 2,
      }}>
        {contact.email && <div>📧 {contact.email}</div>}
        {contact.phone && <div>📱 {contact.phone}</div>}
        {contact.location && <div>📍 {contact.location}</div>}
        {contact.linkedin && <div>🔗 {contact.linkedin}</div>}
        {contact.github && <div>💻 {contact.github}</div>}
        {contact.website && <div>🌐 {contact.website}</div>}
      </div>
    </div>
  );
};
