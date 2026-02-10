import * as React from 'react';
import { ContactInfo } from '../../../../../types';

export interface MinimalistSidebarProps {
  contact: ContactInfo;
  photoUrl?: string;
  colors: {
    primary: string;
    text: string;
    muted: string;
    background: string;
  };
}

export const MinimalistSidebar: React.FC<MinimalistSidebarProps> = ({ contact, photoUrl, colors }) => {
  return (
    <div style={{
      padding: '32px 20px',
      borderRight: `1px solid ${colors.primary}20`,
      height: '100%',
    }}>
      {photoUrl && (
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '4px',
          overflow: 'hidden',
          margin: '0 auto 20px',
          border: `1px solid ${colors.primary}30`,
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

      <div style={{ marginTop: '24px' }}>
        {contact.email && (
          <div style={{
            marginBottom: '14px',
            paddingBottom: '14px',
            borderBottom: `1px solid ${colors.primary}15`,
          }}>
            <div style={{
              fontSize: '8px',
              color: colors.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px',
              fontWeight: 600,
            }}>
              Email
            </div>
            <div style={{
              fontSize: '9px',
              color: colors.text,
              wordBreak: 'break-word',
            }}>
              {contact.email}
            </div>
          </div>
        )}

        {contact.phone && (
          <div style={{
            marginBottom: '14px',
            paddingBottom: '14px',
            borderBottom: `1px solid ${colors.primary}15`,
          }}>
            <div style={{
              fontSize: '8px',
              color: colors.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px',
              fontWeight: 600,
            }}>
              Phone
            </div>
            <div style={{
              fontSize: '9px',
              color: colors.text,
            }}>
              {contact.phone}
            </div>
          </div>
        )}

        {contact.location && (
          <div style={{
            marginBottom: '14px',
            paddingBottom: '14px',
            borderBottom: `1px solid ${colors.primary}15`,
          }}>
            <div style={{
              fontSize: '8px',
              color: colors.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px',
              fontWeight: 600,
            }}>
              Location
            </div>
            <div style={{
              fontSize: '9px',
              color: colors.text,
            }}>
              {contact.location}
            </div>
          </div>
        )}

        {contact.linkedin && (
          <div style={{
            marginBottom: '14px',
            paddingBottom: '14px',
            borderBottom: `1px solid ${colors.primary}15`,
          }}>
            <div style={{
              fontSize: '8px',
              color: colors.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px',
              fontWeight: 600,
            }}>
              LinkedIn
            </div>
            <div style={{
              fontSize: '8px',
              color: colors.primary,
              wordBreak: 'break-all',
            }}>
              {contact.linkedin}
            </div>
          </div>
        )}

        {contact.github && (
          <div style={{
            marginBottom: '14px',
            paddingBottom: '14px',
            borderBottom: `1px solid ${colors.primary}15`,
          }}>
            <div style={{
              fontSize: '8px',
              color: colors.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px',
              fontWeight: 600,
            }}>
              GitHub
            </div>
            <div style={{
              fontSize: '8px',
              color: colors.primary,
              wordBreak: 'break-all',
            }}>
              {contact.github}
            </div>
          </div>
        )}

        {contact.website && (
          <div style={{
            marginBottom: '14px',
            paddingBottom: '14px',
            borderBottom: `1px solid ${colors.primary}15`,
          }}>
            <div style={{
              fontSize: '8px',
              color: colors.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px',
              fontWeight: 600,
            }}>
              Website
            </div>
            <div style={{
              fontSize: '8px',
              color: colors.primary,
              wordBreak: 'break-all',
            }}>
              {contact.website}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
