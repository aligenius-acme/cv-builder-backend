import * as React from 'react';

export interface ColorCodedSkillsProps {
  skills: string[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

const categorizeSkill = (skill: string): 'technical' | 'language' | 'tool' | 'soft' => {
  const lowerSkill = skill.toLowerCase();

  const languages = ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'swift', 'kotlin'];
  if (languages.some(lang => lowerSkill.includes(lang))) return 'language';

  const tools = ['git', 'docker', 'kubernetes', 'jenkins', 'jira', 'figma', 'photoshop'];
  if (tools.some(tool => lowerSkill.includes(tool))) return 'tool';

  const soft = ['leadership', 'communication', 'teamwork', 'problem-solving', 'agile', 'scrum'];
  if (soft.some(s => lowerSkill.includes(s))) return 'soft';

  return 'technical';
};

const getCategoryColor = (category: string, primaryColor: string): { bg: string; border: string; text: string } => {
  switch (category) {
    case 'language':
      return { bg: '#3b82f620', border: '#3b82f6', text: '#1e40af' };
    case 'tool':
      return { bg: '#10b98120', border: '#10b981', text: '#065f46' };
    case 'soft':
      return { bg: '#f59e0b20', border: '#f59e0b', text: '#92400e' };
    default: // technical
      return { bg: `${primaryColor}20`, border: primaryColor, text: primaryColor };
  }
};

export const ColorCodedSkills: React.FC<ColorCodedSkillsProps> = ({ skills, colors }) => {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
    }}>
      {skills.map((skill, index) => {
        const category = categorizeSkill(skill);
        const categoryColor = getCategoryColor(category, colors.primary);

        return (
          <span
            key={index}
            style={{
              padding: '6px 14px',
              backgroundColor: categoryColor.bg,
              color: categoryColor.text,
              border: `1px solid ${categoryColor.border}`,
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
            }}
          >
            {skill}
          </span>
        );
      })}
    </div>
  );
};
