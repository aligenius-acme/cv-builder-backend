import { Request } from 'express';
import { User, UserRole, PlanType } from '@prisma/client';

// Extended Request with user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    organizationId?: string | null;
    planType: PlanType;
  };
}

// Resume parsed data structure
export interface ParsedResumeData {
  summary?: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  certifications?: CertificationEntry[];
  projects?: ProjectEntry[];
  languages?: string[];
  awards?: AwardEntry[];
  contact: ContactInfo;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description: string[];
}

export interface EducationEntry {
  degree: string;
  institution: string;
  location?: string;
  graduationDate?: string;
  gpa?: string;
  achievements?: string[];
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
  link?: string;
  company?: string;
  dates?: string;
}

export interface CertificationEntry {
  name: string;
  issuer?: string;
  date?: string;
}

export interface AwardEntry {
  name: string;
  issuer?: string;
  date?: string;
}

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

// Job description extracted data
export interface JobData {
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  keywords: string[];
  qualifications: string[];
  companyInfo?: string;
}

// ATS Analysis Result
export interface ATSAnalysis {
  score: number;
  keywordMatchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  sectionScores: {
    summary: number;
    experience: number;
    skills: number;
    education: number;
    formatting: number;
  };
  formattingIssues: string[];
  recommendations: string[];
  atsExtractedView: string;
  riskyElements: string[];
  honestAssessment?: string; // Blunt assessment of resume competitiveness
}

// Before/After comparison for resume sections
export interface BeforeAfterComparison {
  section: string;
  before: string;
  after: string;
  improvement: string;
  impactLevel: 'High' | 'Medium' | 'Low';
}

// Keyword density tracking
export interface KeywordDensity {
  before: number;
  after: number;
  improvement: string;
}

// Optimization summary
export interface OptimizationSummary {
  sectionsOptimized: number;
  keywordsAdded: number;
  bulletPointsEnhanced: number;
  estimatedATSImprovement: string;
}

// AI Customization Result
export interface CustomizationResult {
  tailoredData: ParsedResumeData;
  tailoredText: string;
  changesExplanation: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  atsScore: number;
  atsDetails: ATSAnalysis;
  truthGuardWarnings: TruthGuardWarning[];
  // New enhanced fields
  beforeAfterComparisons?: BeforeAfterComparison[];
  keywordDensity?: KeywordDensity;
  optimizationSummary?: OptimizationSummary;
}

// Truth Guard Warning
export interface TruthGuardWarning {
  type: 'exaggeration' | 'inconsistency' | 'unsupported_claim';
  section: string;
  original: string;
  concern: string;
  severity: 'low' | 'medium' | 'high';
}

// Cover Letter Generation
export interface CoverLetterInput {
  resumeData: ParsedResumeData;
  jobData: JobData;
  jobTitle: string;
  companyName: string;
  tone?: 'professional' | 'enthusiastic' | 'formal';
}

// Anonymization fields
export interface AnonymizationConfig {
  maskName: boolean;
  maskEmail: boolean;
  maskPhone: boolean;
  maskLocation: boolean;
  maskCompanyNames: boolean;
}

// Template configuration
export interface TemplateConfig {
  name: string;
  layout: 'single-column' | 'two-column';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: {
    header: number;
    subheader: number;
    body: number;
  };
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  sections: {
    order: string[];
    visible: Record<string, boolean>;
  };
}

// Subscription limits
export interface SubscriptionLimits {
  maxResumes: number;
  maxVersionsPerResume: number;
  coverLettersEnabled: boolean;
  atsSimulatorEnabled: boolean;
  customTemplatesEnabled: boolean;
  anonymizationEnabled: boolean;
}

// AI Provider types
export type AIProvider = 'groq';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
