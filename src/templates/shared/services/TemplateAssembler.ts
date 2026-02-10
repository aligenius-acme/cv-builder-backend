/**
 * Template Assembler Service
 * Dynamically loads and combines component variants into complete templates
 */

import * as React from 'react';
import { ParsedResumeData } from '../../../types';
import { TemplateConfig, ColorScheme } from '../types/templateConfig';

// Import variant registries
import { headerVariants } from '../components/variants/headers';
import { experienceVariants } from '../components/variants/experience';
import { skillsVariants } from '../components/variants/skills';
import { educationVariants } from '../components/variants/education';
import { sidebarVariants } from '../components/variants/sidebars';

export class TemplateAssembler {
  /**
   * Dynamically import a component variant
   */
  private static async loadComponent(
    category: 'headers' | 'experience' | 'skills' | 'education' | 'sidebars',
    variantName: string
  ): Promise<React.ComponentType<any>> {
    try {
      const module = await import(`../components/variants/${category}/${variantName}`);
      return module[variantName] || module.default;
    } catch (error) {
      console.error(`Failed to load component: ${category}/${variantName}`, error);
      throw new Error(`Component not found: ${category}/${variantName}`);
    }
  }

  /**
   * Load all components specified in template config
   */
  static async loadTemplateComponents(config: TemplateConfig): Promise<{
    HeaderComponent: React.ComponentType<any>;
    ExperienceComponent: React.ComponentType<any>;
    SkillsComponent: React.ComponentType<any>;
    EducationComponent: React.ComponentType<any>;
    SidebarComponent?: React.ComponentType<any>;
  }> {
    const components: any = {};

    // Load header
    const headerComponentName = headerVariants[config.components.header];
    components.HeaderComponent = await this.loadComponent('headers', headerComponentName);

    // Load experience
    const experienceComponentName = experienceVariants[config.components.experience];
    components.ExperienceComponent = await this.loadComponent('experience', experienceComponentName);

    // Load skills
    const skillsComponentName = skillsVariants[config.components.skills];
    components.SkillsComponent = await this.loadComponent('skills', skillsComponentName);

    // Load education
    const educationComponentName = educationVariants[config.components.education];
    components.EducationComponent = await this.loadComponent('education', educationComponentName);

    // Load sidebar (optional)
    if (config.components.sidebar) {
      const sidebarComponentName = sidebarVariants[config.components.sidebar];
      components.SidebarComponent = await this.loadComponent('sidebars', sidebarComponentName);
    }

    return components;
  }

  /**
   * Assemble a complete template from configuration
   */
  static async assembleTemplate(
    config: TemplateConfig,
    data: ParsedResumeData
  ): Promise<React.ReactElement> {
    // Load all component variants
    const {
      HeaderComponent,
      ExperienceComponent,
      SkillsComponent,
      EducationComponent,
      SidebarComponent,
    } = await this.loadTemplateComponents(config);

    // Prepare color props
    const colors = {
      primary: config.colorScheme.primary,
      secondary: config.colorScheme.secondary,
      accent: config.colorScheme.accent,
      text: config.colorScheme.text,
      muted: config.colorScheme.muted,
      background: config.colorScheme.background,
    };

    // Build section components based on section order
    const sections = config.sections.order.map((sectionName) => {
      switch (sectionName) {
        case 'summary':
          return data.summary
            ? React.createElement('div', { key: 'summary' }, [
                React.createElement('h2', {
                  key: 'summary-header',
                  style: {
                    fontSize: '14px',
                    color: colors.primary,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '12px',
                    marginTop: '24px',
                  },
                }, 'Professional Summary'),
                React.createElement('p', {
                  key: 'summary-content',
                  style: {
                    fontSize: '11px',
                    color: colors.text,
                    lineHeight: 1.6,
                    margin: 0,
                  },
                }, data.summary),
              ])
            : null;

        case 'experience':
          return data.experience && data.experience.length > 0
            ? React.createElement('div', { key: 'experience' }, [
                React.createElement('h2', {
                  key: 'experience-header',
                  style: {
                    fontSize: '14px',
                    color: colors.primary,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '12px',
                    marginTop: '24px',
                  },
                }, 'Experience'),
                React.createElement(ExperienceComponent, {
                  key: 'experience-content',
                  experiences: data.experience,
                  colors,
                }),
              ])
            : null;

        case 'education':
          return data.education && data.education.length > 0
            ? React.createElement('div', { key: 'education' }, [
                React.createElement('h2', {
                  key: 'education-header',
                  style: {
                    fontSize: '14px',
                    color: colors.primary,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '12px',
                    marginTop: '24px',
                  },
                }, 'Education'),
                React.createElement(EducationComponent, {
                  key: 'education-content',
                  education: data.education,
                  colors,
                }),
              ])
            : null;

        case 'skills':
          return data.skills && data.skills.length > 0
            ? React.createElement('div', { key: 'skills' }, [
                React.createElement('h2', {
                  key: 'skills-header',
                  style: {
                    fontSize: '14px',
                    color: colors.primary,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '12px',
                    marginTop: '24px',
                  },
                }, 'Skills'),
                React.createElement(SkillsComponent, {
                  key: 'skills-content',
                  skills: data.skills,
                  colors,
                }),
              ])
            : null;

        case 'projects':
          return data.projects && data.projects.length > 0
            ? React.createElement('div', { key: 'projects' }, [
                React.createElement('h2', {
                  key: 'projects-header',
                  style: {
                    fontSize: '14px',
                    color: colors.primary,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '12px',
                    marginTop: '24px',
                  },
                }, 'Projects'),
                React.createElement('div', {
                  key: 'projects-content',
                }, data.projects.map((project, index) =>
                  React.createElement('div', {
                    key: index,
                    style: { marginBottom: '16px' },
                  }, [
                    React.createElement('h3', {
                      key: 'name',
                      style: {
                        fontSize: '12px',
                        color: colors.text,
                        fontWeight: 600,
                        margin: 0,
                      },
                    }, project.name),
                    React.createElement('p', {
                      key: 'description',
                      style: {
                        fontSize: '10px',
                        color: colors.text,
                        lineHeight: 1.6,
                        margin: '4px 0',
                      },
                    }, project.description),
                    project.technologies && React.createElement('div', {
                      key: 'tech',
                      style: {
                        fontSize: '9px',
                        color: colors.muted,
                        marginTop: '4px',
                      },
                    }, `Technologies: ${project.technologies.join(', ')}`),
                  ])
                )),
              ])
            : null;

        case 'certifications':
          return data.certifications && data.certifications.length > 0
            ? React.createElement('div', { key: 'certifications' }, [
                React.createElement('h2', {
                  key: 'certifications-header',
                  style: {
                    fontSize: '14px',
                    color: colors.primary,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '12px',
                    marginTop: '24px',
                  },
                }, 'Certifications'),
                React.createElement('div', {
                  key: 'certifications-content',
                }, data.certifications.map((cert, index) =>
                  React.createElement('div', {
                    key: index,
                    style: { marginBottom: '8px' },
                  }, [
                    React.createElement('div', {
                      key: 'cert-row',
                      style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                      },
                    }, [
                      React.createElement('span', {
                        key: 'name',
                        style: {
                          fontSize: '11px',
                          color: colors.text,
                          fontWeight: 500,
                        },
                      }, cert.name),
                      cert.date && React.createElement('span', {
                        key: 'date',
                        style: {
                          fontSize: '9px',
                          color: colors.muted,
                        },
                      }, cert.date),
                    ]),
                    cert.issuer && React.createElement('div', {
                      key: 'issuer',
                      style: {
                        fontSize: '9px',
                        color: colors.muted,
                        marginTop: '2px',
                      },
                    }, cert.issuer),
                  ])
                )),
              ])
            : null;

        default:
          return null;
      }
    }).filter(Boolean);

    // Build the template based on layout
    if (config.layout === 'single-column') {
      return React.createElement('div', {
        style: {
          fontFamily: this.getFontFamily(config.fontConfig.bodyFont),
          fontSize: this.getFontSize(config.fontConfig.size),
          color: colors.text,
          backgroundColor: colors.background,
          padding: '40px',
          maxWidth: '210mm',
          minHeight: '297mm',
          margin: '0 auto',
        },
      }, [
        React.createElement(HeaderComponent, {
          key: 'header',
          contact: data.contact,
          colors,
          photoUrl: data.contact.photoUrl,
        }),
        ...sections,
      ]);
    } else if (config.layout === 'two-column-left' || config.layout === 'two-column-right') {
      const sidebarContent = SidebarComponent
        ? React.createElement(SidebarComponent, {
            key: 'sidebar',
            contact: data.contact,
            skills: data.skills || [],
            colors,
            photoUrl: data.contact.photoUrl,
            summary: data.summary,
          })
        : null;

      const mainContent = React.createElement('div', {
        key: 'main-content',
        style: { flex: 1, padding: '40px' },
      }, [
        React.createElement(HeaderComponent, {
          key: 'header',
          contact: data.contact,
          colors,
          photoUrl: data.contact.photoUrl,
        }),
        ...sections.filter(s => {
          // Don't duplicate skills in main content if they're in sidebar
          const key = (s as any)?.key;
          return key !== 'skills' || !SidebarComponent;
        }),
      ]);

      return React.createElement('div', {
        style: {
          fontFamily: this.getFontFamily(config.fontConfig.bodyFont),
          fontSize: this.getFontSize(config.fontConfig.size),
          color: colors.text,
          backgroundColor: colors.background,
          display: 'flex',
          minHeight: '297mm',
        },
      }, config.layout === 'two-column-left'
        ? [
            React.createElement('div', {
              key: 'sidebar',
              style: { width: '35%', flexShrink: 0 },
            }, sidebarContent),
            mainContent,
          ]
        : [
            mainContent,
            React.createElement('div', {
              key: 'sidebar',
              style: { width: '35%', flexShrink: 0 },
            }, sidebarContent),
          ]
      );
    }

    throw new Error(`Unsupported layout: ${config.layout}`);
  }

  /**
   * Helper to get font family CSS
   */
  private static getFontFamily(fontType: 'serif' | 'sans' | 'mono'): string {
    switch (fontType) {
      case 'serif':
        return 'Georgia, Times, serif';
      case 'mono':
        return 'Courier New, Courier, monospace';
      case 'sans':
      default:
        return 'Helvetica, Arial, sans-serif';
    }
  }

  /**
   * Helper to get font size
   */
  private static getFontSize(size: 'small' | 'medium' | 'large'): string {
    switch (size) {
      case 'small':
        return '10px';
      case 'large':
        return '12px';
      case 'medium':
      default:
        return '11px';
    }
  }
}
