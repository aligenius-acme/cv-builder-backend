/**
 * Shared Components and Utilities Test
 * Verifies that all shared resources can be imported and have correct types
 */

import { describe, it, expect } from '@jest/globals';

describe('Shared Components', () => {
  it('should export all component types', () => {
    // Import component types
    const componentsModule = require('../shared/components');

    expect(componentsModule).toBeDefined();
    expect(componentsModule.Header).toBeDefined();
    expect(componentsModule.ContactInfo).toBeDefined();
    expect(componentsModule.SectionHeader).toBeDefined();
    expect(componentsModule.ExperienceSection).toBeDefined();
    expect(componentsModule.EducationSection).toBeDefined();
    expect(componentsModule.SkillsSection).toBeDefined();
    expect(componentsModule.ProjectsSection).toBeDefined();
    expect(componentsModule.CertificationsSection).toBeDefined();
  });
});

describe('Style Utilities', () => {
  it('should export color utilities', () => {
    const colors = require('../shared/styles/colors');

    expect(colors.colorPalettes).toBeDefined();
    expect(colors.colorPalettes.professional).toBeDefined();
    expect(colors.getColorPalette).toBeDefined();
    expect(colors.hexToRgb).toBeDefined();
  });

  it('should export typography utilities', () => {
    const typography = require('../shared/styles/typography');

    expect(typography.fontSizes).toBeDefined();
    expect(typography.fontWeights).toBeDefined();
    expect(typography.textStyles).toBeDefined();
    expect(typography.getFontSize).toBeDefined();
  });

  it('should export spacing utilities', () => {
    const spacing = require('../shared/styles/spacing');

    expect(spacing.spacing).toBeDefined();
    expect(spacing.pageMargins).toBeDefined();
    expect(spacing.sectionSpacing).toBeDefined();
    expect(spacing.getSpacing).toBeDefined();
  });
});

describe('Utility Functions', () => {
  it('should export formatters', () => {
    const formatters = require('../shared/utils/formatters');

    expect(formatters.formatDate).toBeDefined();
    expect(formatters.formatDateRange).toBeDefined();
    expect(formatters.formatPhoneNumber).toBeDefined();
    expect(formatters.ensureBulletPoint).toBeDefined();
  });

  it('should export layout helpers', () => {
    const layoutHelpers = require('../shared/utils/layoutHelpers');

    expect(layoutHelpers.centerHorizontally).toBeDefined();
    expect(layoutHelpers.getContentBounds).toBeDefined();
    expect(layoutHelpers.stackVertical).toBeDefined();
  });

  it('should export ATS optimization utilities', () => {
    const atsOptimization = require('../shared/utils/atsOptimization');

    expect(atsOptimization.sanitizeForATS).toBeDefined();
    expect(atsOptimization.analyzeATSCompatibility).toBeDefined();
    expect(atsOptimization.extractKeywords).toBeDefined();
  });
});

describe('Template Interface', () => {
  it('should export template types', () => {
    const templateIndex = require('../index');

    expect(templateIndex.templateRegistry).toBeDefined();
    expect(templateIndex.TemplateRegistry).toBeDefined();
    expect(templateIndex.createTemplateMetadata).toBeDefined();
    expect(templateIndex.validateTemplateData).toBeDefined();
  });

  it('should validate template data correctly', () => {
    const { validateTemplateData } = require('../index');

    const validData = {
      contact: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      experience: [
        {
          title: 'Software Engineer',
          company: 'Tech Corp',
          description: ['Built features'],
        },
      ],
      education: [
        {
          degree: 'BS Computer Science',
          institution: 'University',
        },
      ],
      skills: ['JavaScript', 'TypeScript'],
    };

    const result = validateTemplateData(validData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing required fields', () => {
    const { validateTemplateData } = require('../index');

    const invalidData = {
      contact: {},
      experience: [],
      education: [],
      skills: [],
    };

    const result = validateTemplateData(invalidData);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.missingFields.length).toBeGreaterThan(0);
  });
});

describe('Template Registry', () => {
  it('should allow registering and retrieving templates', () => {
    const { TemplateRegistry } = require('../index');
    const registry = new TemplateRegistry();

    const mockTemplate = {
      id: 'test-template',
      name: 'Test Template',
      metadata: {
        id: 'test-template',
        name: 'Test Template',
        category: 'professional',
        atsScore: 90,
        bestFor: ['Software Engineering'],
      },
      PDFComponent: () => null,
      generateDOCX: () => ({}),
    };

    registry.register(mockTemplate as any);

    expect(registry.count()).toBe(1);
    expect(registry.getTemplate('test-template')).toBeDefined();
    expect(registry.getTemplate('test-template')?.name).toBe('Test Template');
  });
});
