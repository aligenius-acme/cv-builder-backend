import * as React from 'react';

export interface CategorizedSkillsProps {
  skills: string[];
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
}

// Helper to categorize skills (basic heuristic)
const categorizeSkills = (skills: string[]) => {
  const categories: Record<string, string[]> = {
    'Technical': [],
    'Languages': [],
    'Tools': [],
    'Other': [],
  };

  const techKeywords = ['React', 'Node', 'Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'API', 'Git'];
  const langKeywords = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic', 'Portuguese'];
  const toolKeywords = ['Excel', 'PowerPoint', 'Word', 'Tableau', 'Figma', 'Photoshop', 'Illustrator', 'Jira', 'Slack'];

  skills.forEach(skill => {
    if (techKeywords.some(k => skill.toLowerCase().includes(k.toLowerCase()))) {
      categories['Technical'].push(skill);
    } else if (langKeywords.some(k => skill.toLowerCase().includes(k.toLowerCase()))) {
      categories['Languages'].push(skill);
    } else if (toolKeywords.some(k => skill.toLowerCase().includes(k.toLowerCase()))) {
      categories['Tools'].push(skill);
    } else {
      categories['Other'].push(skill);
    }
  });

  // Remove empty categories
  return Object.entries(categories).filter(([_, skills]) => skills.length > 0);
};

export const CategorizedSkills: React.FC<CategorizedSkillsProps> = ({ skills, colors }) => {
  const categorized = categorizeSkills(skills);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: categorized.length > 2 ? 'repeat(2, 1fr)' : '1fr',
      gap: '16px',
    }}>
      {categorized.map(([category, categorySkills]) => (
        <div key={category}>
          <div style={{
            fontSize: '11px',
            color: colors.primary,
            fontWeight: 700,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {category}
          </div>
          <div style={{
            fontSize: '10px',
            color: colors.text,
            lineHeight: 1.8,
          }}>
            {categorySkills.join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
};
