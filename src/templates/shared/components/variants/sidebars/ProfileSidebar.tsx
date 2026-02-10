import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface ProfileSidebarProps {
  contact: ContactInfo;
  skills: string[];
  colors: {
    primary: string;
    text: string;
    muted: string;
    background: string;
  };
  photoUrl?: string;
  summary?: string;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  contact,
  skills,
  colors,
  photoUrl,
  summary,
}) => {
  return (
    <div style={{
      backgroundColor: colors.primary,
      color: colors.background,
      padding: '32px 20px',
      height: '100%',
    }}>
      {photoUrl && (
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          overflow: 'hidden',
          margin: '0 auto 20px',
          border: `4px solid ${colors.background}`,
        }}>
          <img src={photoUrl} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <h1 style={{
        fontSize: '18px',
        color: colors.background,
        fontWeight: 700,
        marginBottom: '8px',
        textAlign: 'center',
      }}>
        {contact.name}
      </h1>

      {summary && (
        <>
          <h2 style={{
            fontSize: '11px',
            color: colors.background,
            fontWeight: 700,
            marginTop: '24px',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            opacity: 0.9,
          }}>
            About
          </h2>
          <p style={{
            fontSize: '9px',
            color: colors.background,
            lineHeight: 1.6,
            opacity: 0.85,
            margin: 0,
          }}>
            {summary}
          </p>
        </>
      )}

      <h2 style={{
        fontSize: '11px',
        color: colors.background,
        fontWeight: 700,
        marginTop: '24px',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        opacity: 0.9,
      }}>
        Contact
      </h2>

      <div style={{
        fontSize: '9px',
        color: colors.background,
        lineHeight: 2,
        opacity: 0.85,
      }}>
        {contact.email && <div style={{ marginBottom: '6px', wordBreak: 'break-word' }}>✉ {contact.email}</div>}
        {contact.phone && <div style={{ marginBottom: '6px' }}>☎ {contact.phone}</div>}
        {contact.location && <div style={{ marginBottom: '6px' }}>📍 {contact.location}</div>}
        {contact.linkedin && <div style={{ marginBottom: '6px', wordBreak: 'break-word' }}>🔗 {contact.linkedin}</div>}
        {contact.github && <div style={{ marginBottom: '6px', wordBreak: 'break-word' }}>💻 {contact.github}</div>}
      </div>

      {skills && skills.length > 0 && (
        <>
          <h2 style={{
            fontSize: '11px',
            color: colors.background,
            fontWeight: 700,
            marginTop: '24px',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            opacity: 0.9,
          }}>
            Key Skills
          </h2>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
          }}>
            {skills.slice(0, 10).map((skill, index) => (
              <span
                key={index}
                style={{
                  fontSize: '8px',
                  color: colors.primary,
                  backgroundColor: colors.background,
                  padding: '4px 8px',
                  borderRadius: '3px',
                  fontWeight: 600,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
