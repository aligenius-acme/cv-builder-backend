import * as React from 'react';

export interface SkillsSidebarProps {
  skills: string[];
  colors: {
    primary: string;
    text: string;
    muted: string;
    background: string;
  };
}

export const SkillsSidebar: React.FC<SkillsSidebarProps> = ({ skills, colors }) => {
  return (
    <div style={{
      backgroundColor: `${colors.primary}10`,
      padding: '24px 20px',
      height: '100%',
    }}>
      <h2 style={{
        fontSize: '14px',
        color: colors.primary,
        fontWeight: 700,
        marginBottom: '16px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}>
        Skills
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {skills.map((skill, index) => (
          <div
            key={index}
            style={{
              fontSize: '10px',
              color: colors.text,
              padding: '6px 12px',
              backgroundColor: colors.background,
              borderRadius: '4px',
              borderLeft: `3px solid ${colors.primary}`,
            }}
          >
            {skill}
          </div>
        ))}
      </div>
    </div>
  );
};
