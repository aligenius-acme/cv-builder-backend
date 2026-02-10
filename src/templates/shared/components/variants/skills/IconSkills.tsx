import * as React from 'react';

export interface IconSkillsProps {
  skills: string[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

const getSkillIcon = (skill: string): string => {
  const lowerSkill = skill.toLowerCase();
  if (lowerSkill.includes('javascript') || lowerSkill.includes('js')) return '📜';
  if (lowerSkill.includes('typescript') || lowerSkill.includes('ts')) return '📘';
  if (lowerSkill.includes('react')) return '⚛️';
  if (lowerSkill.includes('node')) return '🟢';
  if (lowerSkill.includes('python')) return '🐍';
  if (lowerSkill.includes('java')) return '☕';
  if (lowerSkill.includes('git')) return '🔀';
  if (lowerSkill.includes('docker')) return '🐳';
  if (lowerSkill.includes('aws')) return '☁️';
  if (lowerSkill.includes('sql') || lowerSkill.includes('database')) return '🗄️';
  if (lowerSkill.includes('api')) return '🔌';
  if (lowerSkill.includes('css')) return '🎨';
  if (lowerSkill.includes('html')) return '🌐';
  return '⚙️';
};

export const IconSkills: React.FC<IconSkillsProps> = ({ skills, colors }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '12px',
    }}>
      {skills.map((skill, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            backgroundColor: `${colors.primary}08`,
            borderRadius: '6px',
            border: `1px solid ${colors.primary}20`,
          }}
        >
          <span style={{ fontSize: '18px' }}>{getSkillIcon(skill)}</span>
          <span style={{
            fontSize: '11px',
            color: colors.text,
            fontWeight: 500,
          }}>
            {skill}
          </span>
        </div>
      ))}
    </div>
  );
};
