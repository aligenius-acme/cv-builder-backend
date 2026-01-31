/**
 * Executive & Leadership Templates
 * Premium templates for senior executives and leadership positions
 *
 * This module contains 10 professional templates designed for:
 * - C-Suite Executives (CEO, CFO, COO, CTO, CMO)
 * - Vice Presidents and Senior VPs
 * - Directors and Senior Directors
 * - Board Members and Advisory Board Positions
 * - Managing Directors and Executive Leaders
 *
 * Features:
 * - Executive summary prominent in all templates
 * - Impact metrics and achievements emphasis
 * - Professional serif typography (Georgia, Garamond, Baskerville, Times)
 * - Rich executive color schemes (Navy, Burgundy, Charcoal, Forest Green, Gold)
 * - Two-page optimized layouts
 * - ATS compatibility: 85-92%
 *
 * Template Categories:
 * - Single-column templates (1-5): Clean, traditional executive style
 * - Two-column templates (6-8): Sidebar with key metrics/competencies
 * - Premium PDF-only (9-10): Complex visual design elements
 *
 * DOCX Support:
 * - Templates 1-8: Full DOCX export support
 * - Templates 9-10: PDF-only (complex visual elements)
 */

// Template 1: Executive Impact (Single-column, Navy, DOCX)
export { ExecutiveImpact, default as ExecutiveImpactTemplate } from './ExecutiveImpact';

// Template 2: C-Suite Elite (Single-column, Burgundy, DOCX)
export { CSuiteElite, default as CSuiteEliteTemplate } from './CSuiteElite';

// Template 3: Leadership Premium (Single-column, Charcoal, DOCX)
export { LeadershipPremium, default as LeadershipPremiumTemplate } from './LeadershipPremium';

// Template 4: Director Professional (Single-column, Forest Green, DOCX)
export { DirectorProfessional, default as DirectorProfessionalTemplate } from './DirectorProfessional';

// Template 5: Senior Executive (Single-column, Navy Blue, DOCX)
export { SeniorExecutive, default as SeniorExecutiveTemplate } from './SeniorExecutive';

// Template 6: VP Executive (Two-column, Dark Blue, DOCX)
export { VPExecutive, default as VPExecutiveTemplate } from './VPExecutive';

// Template 7: Chief Officer (Two-column, Burgundy, DOCX)
export { ChiefOfficer, default as ChiefOfficerTemplate } from './ChiefOfficer';

// Template 8: Board Member (Two-column, Charcoal, DOCX)
export { BoardMember, default as BoardMemberTemplate } from './BoardMember';

// Template 9: Managing Director (Two-column, Navy with Gold, PDF-only)
export { ManagingDirector, default as ManagingDirectorTemplate } from './ManagingDirector';

// Template 10: Executive Leader (Two-column, Deep Blue, PDF-only)
export { ExecutiveLeader, default as ExecutiveLeaderTemplate } from './ExecutiveLeader';

// Export DOCX generator
export { generateExecutiveDOCX } from './generateDOCX';

/**
 * All Executive & Leadership Templates
 */
import { ExecutiveImpact } from './ExecutiveImpact';
import { CSuiteElite } from './CSuiteElite';
import { LeadershipPremium } from './LeadershipPremium';
import { DirectorProfessional } from './DirectorProfessional';
import { SeniorExecutive } from './SeniorExecutive';
import { VPExecutive } from './VPExecutive';
import { ChiefOfficer } from './ChiefOfficer';
import { BoardMember } from './BoardMember';
import { ManagingDirector } from './ManagingDirector';
import { ExecutiveLeader } from './ExecutiveLeader';

export const executiveLeadershipTemplates = [
  ExecutiveImpact,
  CSuiteElite,
  LeadershipPremium,
  DirectorProfessional,
  SeniorExecutive,
  VPExecutive,
  ChiefOfficer,
  BoardMember,
  ManagingDirector,
  ExecutiveLeader,
];

/**
 * Template metadata for quick reference
 */
export const EXECUTIVE_TEMPLATE_INFO = {
  totalTemplates: 10,
  singleColumn: 5,
  twoColumn: 5,
  docxSupport: 8,
  pdfOnly: 2,
  atsRange: '85-92%',
  categories: {
    traditional: ['ExecutiveImpact', 'CSuiteElite', 'DirectorProfessional'],
    modern: ['LeadershipPremium', 'SeniorExecutive', 'VPExecutive'],
    premium: ['ChiefOfficer', 'BoardMember', 'ManagingDirector', 'ExecutiveLeader'],
  },
  bestFor: {
    ceo: ['ExecutiveImpact', 'CSuiteElite', 'ExecutiveLeader'],
    cfo: ['CSuiteElite', 'ChiefOfficer', 'SeniorExecutive'],
    coo: ['CSuiteElite', 'ChiefOfficer', 'LeadershipPremium'],
    cto: ['CSuiteElite', 'ChiefOfficer', 'VPExecutive'],
    vp: ['VPExecutive', 'SeniorExecutive', 'LeadershipPremium'],
    director: ['DirectorProfessional', 'SeniorExecutive', 'ManagingDirector'],
    board: ['BoardMember', 'ExecutiveImpact', 'SeniorExecutive'],
  },
};

export default executiveLeadershipTemplates;
