import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface ColoredSidebarProps {
  contact: ContactInfo;
  photoUrl?: string;
  skills?: string[];
  about?: string;
  colors: {
    primary: string;
    text: string;
    muted: string;
    background: string;
  };
}

export const ColoredSidebar: React.FC<ColoredSidebarProps> = ({ contact, photoUrl, skills, about, colors }) => {
  return (
    <div style={{
      padding: '32px 24px',
      backgroundColor: colors.primary,
      color: '#ffffff',
      height: '100%',
    }}>
      {photoUrl && (
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          overflow: 'hidden',
          margin: '0 auto 20px',
          border: '3px solid #ffffff',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
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

      {/* About Section */}
      {about && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '10px',
            borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
            paddingBottom: '6px',
          }}>
            About
          </h4>
          <p style={{
            fontSize: '9px',
            lineHeight: 1.6,
            margin: 0,
            opacity: 0.95,
          }}>
            {about}
          </p>
        </div>
      )}

      {/* Contact Section */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '10px',
          borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
          paddingBottom: '6px',
        }}>
          Contact
        </h4>
        <div style={{ fontSize: '9px', lineHeight: 1.8 }}>
          {contact.email && <div style={{ marginBottom: '6px', wordBreak: 'break-word' }}>{contact.email}</div>}
          {contact.phone && <div style={{ marginBottom: '6px' }}>{contact.phone}</div>}
          {contact.location && <div style={{ marginBottom: '6px' }}>{contact.location}</div>}
          {contact.linkedin && <div style={{ marginBottom: '6px', wordBreak: 'break-all', opacity: 0.9 }}>{contact.linkedin}</div>}
          {contact.github && <div style={{ marginBottom: '6px', wordBreak: 'break-all', opacity: 0.9 }}>{contact.github}</div>}
          {contact.website && <div style={{ marginBottom: '6px', wordBreak: 'break-all', opacity: 0.9 }}>{contact.website}</div>}
        </div>
      </div>

      {/* Skills Section */}
      {skills && skills.length > 0 && (
        <div>
          <h4 style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '10px',
            borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
            paddingBottom: '6px',
          }}>
            Skills
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
          }}>
            {skills.map((skill, index) => (
              <span
                key={index}
                style={{
                  padding: '4px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  fontSize: '8px',
                  fontWeight: 600,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
