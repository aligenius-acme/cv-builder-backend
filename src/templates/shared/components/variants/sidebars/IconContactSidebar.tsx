import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface IconContactSidebarProps {
  contact: ContactInfo;
  photoUrl?: string;
  colors: {
    primary: string;
    text: string;
    muted: string;
    background: string;
  };
}

export const IconContactSidebar: React.FC<IconContactSidebarProps> = ({ contact, photoUrl, colors }) => {
  return (
    <div style={{
      padding: '24px 20px',
      backgroundColor: `${colors.primary}10`,
      height: '100%',
    }}>
      {photoUrl && (
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          overflow: 'hidden',
          margin: '0 auto 20px',
          border: `4px solid ${colors.primary}`,
        }}>
          <img
            src={photoUrl}
            alt={contact.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        {contact.email && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}>
            <span style={{ fontSize: '16px' }}>📧</span>
            <span style={{
              fontSize: '10px',
              color: colors.text,
              wordBreak: 'break-word',
            }}>
              {contact.email}
            </span>
          </div>
        )}

        {contact.phone && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}>
            <span style={{ fontSize: '16px' }}>📱</span>
            <span style={{
              fontSize: '10px',
              color: colors.text,
            }}>
              {contact.phone}
            </span>
          </div>
        )}

        {contact.location && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}>
            <span style={{ fontSize: '16px' }}>📍</span>
            <span style={{
              fontSize: '10px',
              color: colors.text,
            }}>
              {contact.location}
            </span>
          </div>
        )}

        {contact.linkedin && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}>
            <span style={{ fontSize: '16px' }}>💼</span>
            <span style={{
              fontSize: '9px',
              color: colors.primary,
              wordBreak: 'break-all',
            }}>
              {contact.linkedin}
            </span>
          </div>
        )}

        {contact.github && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}>
            <span style={{ fontSize: '16px' }}>💻</span>
            <span style={{
              fontSize: '9px',
              color: colors.primary,
              wordBreak: 'break-all',
            }}>
              {contact.github}
            </span>
          </div>
        )}

        {contact.website && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}>
            <span style={{ fontSize: '16px' }}>🌐</span>
            <span style={{
              fontSize: '9px',
              color: colors.primary,
              wordBreak: 'break-all',
            }}>
              {contact.website}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
