import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface ContactSidebarProps {
  contact: ContactInfo;
  colors: {
    primary: string;
    text: string;
    muted: string;
    background: string;
  };
  photoUrl?: string;
}

export const ContactSidebar: React.FC<ContactSidebarProps> = ({ contact, colors, photoUrl }) => {
  return (
    <div style={{
      backgroundColor: `${colors.primary}10`,
      padding: '24px 20px',
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
          <img src={photoUrl} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <h2 style={{
        fontSize: '14px',
        color: colors.primary,
        fontWeight: 700,
        marginBottom: '16px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}>
        Contact
      </h2>

      <div style={{
        fontSize: '10px',
        color: colors.text,
        lineHeight: 2,
      }}>
        {contact.email && (
          <div style={{ marginBottom: '8px', wordBreak: 'break-word' }}>
            <strong>Email:</strong><br />{contact.email}
          </div>
        )}
        {contact.phone && (
          <div style={{ marginBottom: '8px' }}>
            <strong>Phone:</strong><br />{contact.phone}
          </div>
        )}
        {contact.location && (
          <div style={{ marginBottom: '8px' }}>
            <strong>Location:</strong><br />{contact.location}
          </div>
        )}
        {contact.linkedin && (
          <div style={{ marginBottom: '8px', wordBreak: 'break-word' }}>
            <strong>LinkedIn:</strong><br />{contact.linkedin}
          </div>
        )}
        {contact.github && (
          <div style={{ marginBottom: '8px', wordBreak: 'break-word' }}>
            <strong>GitHub:</strong><br />{contact.github}
          </div>
        )}
        {contact.website && (
          <div style={{ marginBottom: '8px', wordBreak: 'break-word' }}>
            <strong>Website:</strong><br />{contact.website}
          </div>
        )}
      </div>
    </div>
  );
};
