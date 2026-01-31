/**
 * SkillsSection Component
 * Displays skills in various layouts (grid, list, pills, categories)
 */

import React from 'react';
import { ColorPalette } from '../styles/colors';
import { textStyles } from '../styles/typography';

// Skill category type for grouped skills
export interface SkillCategory {
  category: string;
  items: string[];
}

export interface SkillsSectionProps {
  skills: string[] | SkillCategory[];
  colors: ColorPalette;
  layout?: 'grid' | 'list' | 'pills' | 'columns' | 'inline';
  columns?: number;
  showBullets?: boolean;
}

/**
 * Grid layout for skills
 */
const SkillsGrid: React.FC<{
  skills: string[];
  colors: ColorPalette;
  columns: number;
}> = ({ skills, colors, columns }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '8px',
        marginBottom: 16,
      }}
    >
      {skills.map((skill, index) => (
        <div
          key={index}
          style={{
            ...textStyles.body,
            color: colors.textLight,
          }}
        >
          • {skill}
        </div>
      ))}
    </div>
  );
};

/**
 * List layout for skills
 */
const SkillsList: React.FC<{
  skills: string[];
  colors: ColorPalette;
  showBullets: boolean;
}> = ({ skills, colors, showBullets }) => {
  return (
    <ul
      style={{
        margin: '0 0 16px 0',
        paddingLeft: showBullets ? 20 : 0,
        listStyleType: showBullets ? 'disc' : 'none',
      }}
    >
      {skills.map((skill, index) => (
        <li
          key={index}
          style={{
            ...textStyles.body,
            color: colors.textLight,
            marginBottom: 4,
          }}
        >
          {skill}
        </li>
      ))}
    </ul>
  );
};

/**
 * Pills/tags layout for skills
 */
const SkillsPills: React.FC<{
  skills: string[];
  colors: ColorPalette;
}> = ({ skills, colors }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: 16,
      }}
    >
      {skills.map((skill, index) => (
        <span
          key={index}
          style={{
            ...textStyles.bodySmall,
            padding: '4px 12px',
            backgroundColor: colors.backgroundAlt,
            color: colors.primary,
            borderRadius: '12px',
            border: `1px solid ${colors.borderLight}`,
            fontWeight: 500,
          }}
        >
          {skill}
        </span>
      ))}
    </div>
  );
};

/**
 * Columns layout for skills
 */
const SkillsColumns: React.FC<{
  skills: string[];
  colors: ColorPalette;
  columns: number;
}> = ({ skills, colors, columns }) => {
  // Distribute skills across columns
  const skillsPerColumn = Math.ceil(skills.length / columns);
  const columnArrays: string[][] = [];

  for (let i = 0; i < columns; i++) {
    const start = i * skillsPerColumn;
    const end = Math.min(start + skillsPerColumn, skills.length);
    columnArrays.push(skills.slice(start, end));
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px',
        marginBottom: 16,
      }}
    >
      {columnArrays.map((columnSkills, colIndex) => (
        <ul
          key={colIndex}
          style={{
            margin: 0,
            paddingLeft: 20,
            listStyleType: 'disc',
          }}
        >
          {columnSkills.map((skill, skillIndex) => (
            <li
              key={skillIndex}
              style={{
                ...textStyles.body,
                color: colors.textLight,
                marginBottom: 3,
              }}
            >
              {skill}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
};

/**
 * Inline layout for skills (comma-separated)
 */
const SkillsInline: React.FC<{
  skills: string[];
  colors: ColorPalette;
}> = ({ skills, colors }) => {
  return (
    <div
      style={{
        ...textStyles.body,
        color: colors.textLight,
        marginBottom: 16,
        lineHeight: 1.6,
      }}
    >
      {skills.join(' • ')}
    </div>
  );
};

/**
 * Main Skills Section component
 */
export const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills,
  colors,
  layout = 'grid',
  columns = 3,
  showBullets = true,
}) => {
  if (!skills || skills.length === 0) {
    return null;
  }

  // Check if skills are categorized
  const isCategorized = skills.length > 0 && typeof skills[0] === 'object' && 'category' in skills[0];

  if (isCategorized) {
    // Use categorized skills component
    const categories = (skills as SkillCategory[]).map(cat => ({
      name: cat.category,
      skills: cat.items,
    }));
    return <CategorizedSkills categories={categories} colors={colors} layout={layout} />;
  }

  // Regular string array skills
  const skillArray = skills as string[];

  switch (layout) {
    case 'grid':
      return <SkillsGrid skills={skillArray} colors={colors} columns={columns} />;

    case 'list':
      return <SkillsList skills={skillArray} colors={colors} showBullets={showBullets} />;

    case 'pills':
      return <SkillsPills skills={skillArray} colors={colors} />;

    case 'columns':
      return <SkillsColumns skills={skillArray} colors={colors} columns={columns} />;

    case 'inline':
      return <SkillsInline skills={skillArray} colors={colors} />;

    default:
      return <SkillsGrid skills={skillArray} colors={colors} columns={columns} />;
  }
};

/**
 * Categorized skills component
 */
export interface CategorizedSkillsProps {
  categories: {
    name: string;
    skills: string[];
  }[];
  colors: ColorPalette;
  layout?: 'grid' | 'list' | 'inline';
}

export const CategorizedSkills: React.FC<CategorizedSkillsProps> = ({
  categories,
  colors,
  layout = 'list',
}) => {
  return (
    <div style={{ marginBottom: 16 }}>
      {categories.map((category, index) => (
        <div key={index} style={{ marginBottom: 10 }}>
          <div
            style={{
              ...textStyles.subtitle,
              color: colors.text,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {category.name}:
          </div>
          <div style={{ paddingLeft: 12 }}>
            <SkillsSection
              skills={category.skills}
              colors={colors}
              layout={layout}
              showBullets={false}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillsSection;
