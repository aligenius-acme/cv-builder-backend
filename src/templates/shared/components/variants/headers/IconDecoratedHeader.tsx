import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface IconDecoratedHeaderProps {
  contact: ContactInfo;
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
  photoUrl?: string;
}

export const IconDecoratedHeader: React.FC<IconDecoratedHeaderProps> = ({ contact, colors, photoUrl }) => {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '16px',
      }}>
        {photoUrl && (
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: `3px solid ${colors.primary}`,
            flexShrink: 0,
          }}>
            <img src={photoUrl} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '36px',
            color: colors.text,
            margin: '0 0 4px 0',
            fontWeight: 700,
          }}>
            {contact.name}
          </h1>
          <div style={{
            width: '60px',
            height: '4px',
            backgroundColor: colors.primary,
            marginBottom: '12px',
          }} />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        fontSize: '11px',
        color: colors.text,
      }}>
        {contact.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: colors.primary, fontSize: '14px' }}>✉</span>
            <span>{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: colors.primary, fontSize: '14px' }}>☎</span>
            <span>{contact.phone}</span>
          </div>
        )}
        {contact.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: colors.primary, fontSize: '14px' }}>📍</span>
            <span>{contact.location}</span>
          </div>
        )}
        {contact.linkedin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: colors.primary, fontSize: '14px' }}>🔗</span>
            <span>{contact.linkedin}</span>
          </div>
        )}
        {contact.github && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: colors.primary, fontSize: '14px' }}>💻</span>
            <span>{contact.github}</span>
          </div>
        )}
        {contact.website && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: colors.primary, fontSize: '14px' }}>🌐</span>
            <span>{contact.website}</span>
          </div>
        )}
      </div>
    </div>
  );
};
