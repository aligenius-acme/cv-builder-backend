/**
 * ATS Professional Templates Category
 * 15 ATS-optimized professional templates for corporate environments
 *
 * All templates in this category feature:
 * - Single-column layout for maximum ATS compatibility (95%+)
 * - Standard fonts (Calibri, Arial, Times New Roman)
 * - Underlined section headers
 * - Conservative color schemes
 * - Professional appearance
 * - Clean, parseable structure
 *
 * Best for: Corporate jobs, traditional industries, finance, legal, consulting
 */

import { ReactTemplate } from '../index';

// Import all 15 ATS Professional templates
import { CorporateStandard } from './CorporateStandard';
import { FinanceProfessional } from './FinanceProfessional';
import { LegalTraditional } from './LegalTraditional';
import { HealthcareClean } from './HealthcareClean';
import { ConsultingClassic } from './ConsultingClassic';
import { ExecutiveFormal } from './ExecutiveFormal';
import { BusinessElegant } from './BusinessElegant';
import { BankingConservative } from './BankingConservative';
import { InsuranceProfessional } from './InsuranceProfessional';
import { AccountingStandard } from './AccountingStandard';
import { CorporateModern } from './CorporateModern';
import { FinanceExecutive } from './FinanceExecutive';
import { LegalMinimal } from './LegalMinimal';
import { ConsultingRefined } from './ConsultingRefined';
import { ProfessionalElite } from './ProfessionalElite';

/**
 * All ATS Professional templates
 */
export const atsProfessionalTemplates: ReactTemplate[] = [
  CorporateStandard,
  FinanceProfessional,
  LegalTraditional,
  HealthcareClean,
  ConsultingClassic,
  ExecutiveFormal,
  BusinessElegant,
  BankingConservative,
  InsuranceProfessional,
  AccountingStandard,
  CorporateModern,
  FinanceExecutive,
  LegalMinimal,
  ConsultingRefined,
  ProfessionalElite,
];

/**
 * Export individual templates
 */
export {
  CorporateStandard,
  FinanceProfessional,
  LegalTraditional,
  HealthcareClean,
  ConsultingClassic,
  ExecutiveFormal,
  BusinessElegant,
  BankingConservative,
  InsuranceProfessional,
  AccountingStandard,
  CorporateModern,
  FinanceExecutive,
  LegalMinimal,
  ConsultingRefined,
  ProfessionalElite,
};

/**
 * Template metadata for quick reference
 */
export const atsProfessionalTemplateMetadata = {
  categoryName: 'ATS Professional',
  categoryDescription: 'Professional templates optimized for Applicant Tracking Systems',
  templateCount: 15,
  avgATSScore: 95.7,
  bestFor: ['Corporate', 'Finance', 'Legal', 'Consulting', 'Healthcare', 'Banking', 'Insurance', 'Accounting'],
  features: {
    atsOptimized: true,
    singleColumn: true,
    standardFonts: true,
    conservativeDesign: true,
    colorCustomization: true,
  },
};

/**
 * Get template by ID
 */
export function getATSProfessionalTemplate(templateId: string): ReactTemplate | undefined {
  return atsProfessionalTemplates.find(template => template.id === templateId);
}

/**
 * Get templates by industry
 */
export function getTemplatesByIndustry(industry: string): ReactTemplate[] {
  return atsProfessionalTemplates.filter(template =>
    template.metadata.bestFor.some(role =>
      role.toLowerCase().includes(industry.toLowerCase())
    )
  );
}

/**
 * Get templates by ATS score threshold
 */
export function getTemplatesByATSScore(minScore: number): ReactTemplate[] {
  return atsProfessionalTemplates.filter(
    template => template.metadata.atsScore >= minScore
  );
}

export default atsProfessionalTemplates;
