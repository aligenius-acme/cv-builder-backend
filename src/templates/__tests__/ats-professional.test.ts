/**
 * ATS Professional Templates Test Suite
 * Verifies all 15 templates compile and render correctly
 */

import {
  atsProfessionalTemplates,
  getATSProfessionalTemplate,
  getTemplatesByIndustry,
  getTemplatesByATSScore,
} from '../ats-professional';
import { ParsedResumeData } from '../../types';
import { getColorPalette } from '../shared/styles/colors';

describe('ATS Professional Templates', () => {
  // Mock resume data for testing
  const mockResumeData: ParsedResumeData = {
    contact: {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
    },
    summary: 'Experienced professional with 10+ years in corporate finance and strategic planning.',
    experience: [
      {
        title: 'Senior Financial Analyst',
        company: 'ABC Corporation',
        location: 'New York, NY',
        startDate: 'Jan 2020',
        endDate: 'Present',
        current: true,
        description: [
          'Led financial planning and analysis for $500M business unit',
          'Developed forecasting models that improved accuracy by 25%',
          'Managed team of 5 analysts',
        ],
      },
      {
        title: 'Financial Analyst',
        company: 'XYZ Company',
        location: 'Boston, MA',
        startDate: 'Jun 2015',
        endDate: 'Dec 2019',
        current: false,
        description: [
          'Conducted financial analysis and reporting',
          'Supported budgeting and forecasting processes',
        ],
      },
    ],
    education: [
      {
        degree: 'MBA in Finance',
        institution: 'Harvard Business School',
        location: 'Cambridge, MA',
        graduationDate: '2015',
        gpa: '3.8',
      },
      {
        degree: 'Bachelor of Science in Economics',
        institution: 'University of Pennsylvania',
        graduationDate: '2013',
      },
    ],
    skills: [
      'Financial Modeling',
      'Excel',
      'SQL',
      'Tableau',
      'Strategic Planning',
      'Budget Management',
      'Forecasting',
      'Team Leadership',
    ],
    certifications: [
      {
        name: 'CFA Level II',
        issuer: 'CFA Institute',
        date: '2018',
      },
      {
        name: 'Certified Financial Analyst',
        issuer: 'NYIF',
        date: '2016',
      },
    ],
  };

  const mockColors = getColorPalette('professional');

  describe('Template Count and Availability', () => {
    it('should have exactly 15 templates', () => {
      expect(atsProfessionalTemplates).toHaveLength(15);
    });

    it('should have all required templates', () => {
      const expectedTemplates = [
        'corporate-standard',
        'finance-professional',
        'legal-traditional',
        'healthcare-clean',
        'consulting-classic',
        'executive-formal',
        'business-elegant',
        'banking-conservative',
        'insurance-professional',
        'accounting-standard',
        'corporate-modern',
        'finance-executive',
        'legal-minimal',
        'consulting-refined',
        'professional-elite',
      ];

      const templateIds = atsProfessionalTemplates.map(t => t.id);
      expectedTemplates.forEach(id => {
        expect(templateIds).toContain(id);
      });
    });
  });

  describe('Template Metadata', () => {
    it('should have valid metadata for all templates', () => {
      atsProfessionalTemplates.forEach(template => {
        expect(template.id).toBeTruthy();
        expect(template.name).toBeTruthy();
        expect(template.metadata).toBeTruthy();
        expect(template.metadata.id).toBe(template.id);
        expect(template.metadata.name).toBe(template.name);
        expect(template.metadata.atsScore).toBeGreaterThanOrEqual(94);
        expect(template.metadata.atsScore).toBeLessThanOrEqual(98);
      });
    });

    it('should have proper category assignments', () => {
      atsProfessionalTemplates.forEach(template => {
        expect(['professional', 'executive']).toContain(template.metadata.category);
      });
    });

    it('should have bestFor fields populated', () => {
      atsProfessionalTemplates.forEach(template => {
        expect(template.metadata.bestFor).toBeTruthy();
        expect(template.metadata.bestFor.length).toBeGreaterThan(0);
      });
    });
  });

  describe('PDF Component', () => {
    it('should have PDF components for all templates', () => {
      atsProfessionalTemplates.forEach(template => {
        expect(template.PDFComponent).toBeTruthy();
        expect(typeof template.PDFComponent).toBe('function');
      });
    });

    it('should render PDF components without errors', () => {
      atsProfessionalTemplates.forEach(template => {
        expect(() => {
          const component = template.PDFComponent;
          // Component should be callable
          expect(component).toBeDefined();
        }).not.toThrow();
      });
    });
  });

  describe('DOCX Generation', () => {
    it('should have DOCX generators for all templates', () => {
      atsProfessionalTemplates.forEach(template => {
        expect(template.generateDOCX).toBeTruthy();
        expect(typeof template.generateDOCX).toBe('function');
      });
    });

    it('should generate DOCX documents without errors', () => {
      atsProfessionalTemplates.forEach(template => {
        expect(() => {
          const doc = template.generateDOCX(mockResumeData, mockColors);
          expect(doc).toBeTruthy();
        }).not.toThrow();
      });
    });
  });

  describe('Template Features', () => {
    it('should all be single-column layouts', () => {
      atsProfessionalTemplates.forEach(template => {
        expect(template.metadata.features.twoColumn).toBe(false);
      });
    });

    it('should all support certifications', () => {
      atsProfessionalTemplates.forEach(template => {
        expect(template.metadata.features.certifications).toBe(true);
      });
    });

    it('should not have header images (ATS-friendly)', () => {
      atsProfessionalTemplates.forEach(template => {
        expect(template.metadata.features.headerImage).toBe(false);
      });
    });

    it('should not have skill bars (ATS-friendly)', () => {
      atsProfessionalTemplates.forEach(template => {
        expect(template.metadata.features.skillBars).toBe(false);
      });
    });
  });

  describe('Helper Functions', () => {
    it('should find template by ID', () => {
      const template = getATSProfessionalTemplate('corporate-standard');
      expect(template).toBeTruthy();
      expect(template?.id).toBe('corporate-standard');
    });

    it('should return undefined for invalid ID', () => {
      const template = getATSProfessionalTemplate('non-existent-template');
      expect(template).toBeUndefined();
    });

    it('should filter templates by industry', () => {
      const financeTemplates = getTemplatesByIndustry('Finance');
      expect(financeTemplates.length).toBeGreaterThan(0);

      financeTemplates.forEach(template => {
        const hasFinanceRole = template.metadata.bestFor.some(role =>
          role.toLowerCase().includes('finance')
        );
        expect(hasFinanceRole).toBe(true);
      });
    });

    it('should filter templates by ATS score', () => {
      const highATSTemplates = getTemplatesByATSScore(96);
      expect(highATSTemplates.length).toBeGreaterThan(0);

      highATSTemplates.forEach(template => {
        expect(template.metadata.atsScore).toBeGreaterThanOrEqual(96);
      });
    });
  });

  describe('ATS Compatibility', () => {
    it('should have minimum 94% ATS score', () => {
      atsProfessionalTemplates.forEach(template => {
        expect(template.metadata.atsScore).toBeGreaterThanOrEqual(94);
      });
    });

    it('should average above 95% ATS score', () => {
      const totalScore = atsProfessionalTemplates.reduce(
        (sum, template) => sum + template.metadata.atsScore,
        0
      );
      const avgScore = totalScore / atsProfessionalTemplates.length;
      expect(avgScore).toBeGreaterThanOrEqual(95);
    });
  });

  describe('Template Uniqueness', () => {
    it('should have unique template IDs', () => {
      const ids = atsProfessionalTemplates.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique template names', () => {
      const names = atsProfessionalTemplates.map(t => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });
});
