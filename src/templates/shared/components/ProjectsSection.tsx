/**
 * ProjectsSection Component
 * Displays project entries with descriptions, technologies, and links
 */

import React from 'react';
import { ProjectEntry } from '../../../types';
import { ColorPalette } from '../styles/colors';
import { textStyles } from '../styles/typography';
import { formatUrlForDisplay, ensureBulletPoint } from '../utils/formatters';

export interface ProjectsSectionProps {
  projects: ProjectEntry[];
  colors: ColorPalette;
  showTechnologies?: boolean;
  showLinks?: boolean;
  layout?: 'default' | 'compact' | 'detailed';
}

/**
 * Single project entry component
 */
export const ProjectItem: React.FC<{
  project: ProjectEntry;
  colors: ColorPalette;
  showTechnologies?: boolean;
  showLinks?: boolean;
  layout?: 'default' | 'compact' | 'detailed';
}> = ({
  project,
  colors,
  showTechnologies = true,
  showLinks = true,
  layout = 'default',
}) => {
  const description = Array.isArray(project.description)
    ? project.description
    : project.description.split('\n').filter(line => line.trim());

  const link = project.url || project.link;
  const technologies = project.technologies || [];

  if (layout === 'compact') {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ marginBottom: 2 }}>
          <span style={{ ...textStyles.body, color: colors.text, fontWeight: 600 }}>
            {project.name}
          </span>
          {project.company && (
            <span style={{ ...textStyles.bodySmall, color: colors.textLight }}>
              {' '}• {project.company}
            </span>
          )}
          {project.dates && (
            <span style={{ ...textStyles.bodySmall, color: colors.textMuted }}>
              {' '}• {project.dates}
            </span>
          )}
        </div>

        {description.length > 0 && (
          <div style={{ ...textStyles.bodySmall, color: colors.textLight, marginBottom: 2 }}>
            {description[0]}
          </div>
        )}

        {showTechnologies && technologies.length > 0 && (
          <div style={{ ...textStyles.bodySmall, color: colors.textMuted }}>
            {technologies.join(', ')}
          </div>
        )}
      </div>
    );
  }

  if (layout === 'detailed') {
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ marginBottom: 4 }}>
          <h3
            style={{
              ...textStyles.h4,
              color: colors.text,
              fontWeight: 700,
              margin: 0,
            }}
          >
            {project.name}
          </h3>
        </div>

        {(project.company || project.dates || (showLinks && link)) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <div style={{ ...textStyles.body, color: colors.textLight }}>
              {project.company && <span>{project.company}</span>}
              {showLinks && link && (
                <span style={{ color: colors.primary, fontWeight: 500 }}>
                  {project.company && ' • '}
                  {formatUrlForDisplay(link)}
                </span>
              )}
            </div>
            {project.dates && (
              <div style={{ ...textStyles.body, color: colors.textMuted }}>
                {project.dates}
              </div>
            )}
          </div>
        )}

        {description.length > 0 && (
          <ul style={{ margin: '4px 0', paddingLeft: 20, listStyleType: 'none' }}>
            {description.map((item, index) => (
              <li
                key={index}
                style={{
                  ...textStyles.body,
                  color: colors.textLight,
                  marginBottom: 3,
                  lineHeight: 1.5,
                }}
              >
                • {ensureBulletPoint(item, '')}
              </li>
            ))}
          </ul>
        )}

        {showTechnologies && technologies.length > 0 && (
          <div
            style={{
              ...textStyles.bodySmall,
              color: colors.textMuted,
              marginTop: 4,
            }}
          >
            <span style={{ fontWeight: 600 }}>Technologies: </span>
            {technologies.join(', ')}
          </div>
        )}
      </div>
    );
  }

  // Default layout
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <div>
          <div style={{ ...textStyles.subtitle, color: colors.text, fontWeight: 700 }}>
            {project.name}
          </div>
          {(project.company || (showLinks && link)) && (
            <div style={{ ...textStyles.body, color: colors.textLight }}>
              {project.company && <span>{project.company}</span>}
              {showLinks && link && (
                <span style={{ color: colors.primary, fontWeight: 500 }}>
                  {project.company && ' • '}
                  {formatUrlForDisplay(link)}
                </span>
              )}
            </div>
          )}
        </div>

        {project.dates && (
          <div style={{ ...textStyles.body, color: colors.textMuted }}>
            {project.dates}
          </div>
        )}
      </div>

      {description.length > 0 && (
        <ul style={{ margin: '4px 0', paddingLeft: 20, listStyleType: 'none' }}>
          {description.map((item, index) => (
            <li
              key={index}
              style={{
                ...textStyles.body,
                color: colors.textLight,
                marginBottom: 2,
              }}
            >
              • {ensureBulletPoint(item, '')}
            </li>
          ))}
        </ul>
      )}

      {showTechnologies && technologies.length > 0 && (
        <div
          style={{
            ...textStyles.bodySmall,
            color: colors.textMuted,
            marginTop: 2,
          }}
        >
          <span style={{ fontWeight: 600 }}>Technologies: </span>
          {technologies.join(', ')}
        </div>
      )}
    </div>
  );
};

/**
 * Projects section container
 */
export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  colors,
  showTechnologies = true,
  showLinks = true,
  layout = 'default',
}) => {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {projects.map((project, index) => (
        <ProjectItem
          key={index}
          project={project}
          colors={colors}
          showTechnologies={showTechnologies}
          showLinks={showLinks}
          layout={layout}
        />
      ))}
    </div>
  );
};

export default ProjectsSection;
