import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface SidebarContactHeaderProps {
  contact: ContactInfo;
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
  photoUrl?: string;
}

export const SidebarContactHeader: React.FC<SidebarContactHeaderProps> = ({ contact, colors, photoUrl }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '32px',
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: `2px solid ${colors.primary}20`,
    }}>
      <div style={{ flex: 1 }}>
        <h1 style={{
          fontSize: '36px',
          color: colors.text,
          margin: '0 0 16px 0',
          fontWeight: 700,
        }}>
          {contact.name}
        </h1>
      </div>

      <div style={{
        width: '200px',
        backgroundColor: `${colors.primary}08`,
        padding: '20px',
        borderRadius: '8px',
        flexShrink: 0,
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

        <div style={{
          fontSize: '9px',
          color: colors.text,
          lineHeight: 2,
        }}>
          {contact.email && <div style={{ marginBottom: '6px', wordBreak: 'break-word' }}><strong>Email:</strong><br />{contact.email}</div>}
          {contact.phone && <div style={{ marginBottom: '6px' }}><strong>Phone:</strong><br />{contact.phone}</div>}
          {contact.location && <div style={{ marginBottom: '6px' }}><strong>Location:</strong><br />{contact.location}</div>}
          {contact.linkedin && <div style={{ marginBottom: '6px', wordBreak: 'break-word', color: colors.primary }}>{contact.linkedin}</div>}
          {contact.github && <div style={{ marginBottom: '6px', wordBreak: 'break-word', color: colors.primary }}>{contact.github}</div>}
        </div>
      </div>
    </div>
  );
};
