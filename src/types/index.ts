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

// Skill category type for grouped skills
export interface SkillCategory {
  category: string;
  items: string[];
}

// Publication entry type
export interface PublicationEntry {
  title: string;
  authors?: string[];
  venue: string;
  year: string;
  citations?: number;
  awards?: string[];
  type?: string;
}

// Leadership entry type
export interface LeadershipEntry {
  role: string;
  organization: string;
  period: string;
  highlights?: string[];
}

// Volunteer work entry type
export interface VolunteerWorkEntry {
  role: string;
  organization: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string[];
}

// Resume parsed data structure
export interface ParsedResumeData {
  summary?: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[] | SkillCategory[]; // Can be simple list or categorized
  certifications?: CertificationEntry[];
  projects?: ProjectEntry[];
  languages?: string[];
  awards?: AwardEntry[] | string[]; // Can be objects or simple strings
  contact: ContactInfo;
  photoUrl?: string; // Profile photo URL
  // Optional extended fields for academic/executive templates
  publications?: (string | PublicationEntry)[];
  leadership?: (string | LeadershipEntry)[];
  achievements?: string[];
  professionalAffiliations?: string[];
  grants?: string[]; // Research grants (academic)
  speaking?: string[]; // Speaking engagements (creative/executive)
  volunteerWork?: (string | VolunteerWorkEntry)[]; // Volunteer work (entry-level) - can be simple strings or detailed entries
}

export interface ExperienceEntry {
  title?: string; // Job title
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string[]; // Bullet points describing work
  position?: string; // Alternative to title (academic templates)
  highlights?: string[]; // Alternative to description (sample data)
}

export interface EducationEntry {
  degree: string;
  institution: string;
  location?: string;
  graduationDate?: string;
  gpa?: string;
  achievements?: string[];
  honors?: string | string[]; // For academic templates - can be string or array
  thesis?: string; // For academic templates
  advisor?: string; // For academic templates (PhD advisor)
  relevantCoursework?: string[]; // For entry-level templates
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
  link?: string;
  company?: string;
  dates?: string;
  highlights?: string[]; // For creative templates
}

export interface CertificationEntry {
  name: string;
  issuer?: string;
  date?: string;
  status?: string; // For professional templates
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
  portfolio?: string; // For creative templates
  photoUrl?: string; // Profile photo URL
}

// Job description extracted data
export interface JobData {
  jobField?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  keywords: string[];
  qualifications: string[];
  companyInfo?: string;
}

// Detailed recommendation for specific issue
export interface DetailedRecommendation {
  issue: string;
  location: string;
  currentText: string;
  suggestedText: string;
  reasoning: string;
  estimatedScoreImpact: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  keywords: string[];
  implementation: string;
}

// Missing keyword details
export interface MissingKeywordDetail {
  keyword: string;
  importance: string;
  suggestedLocation: string;
  exampleUsage: string;
  relatedKeywords: string[];
  currentGap: string;
}

// Section-specific improvement
export interface SectionImprovement {
  change: string;
  before: string;
  after: string;
  impact: string;
}

// Experience bullet improvement
export interface BulletImprovement {
  bulletPoint: string;
  weaknesses: string[];
  enhanced: string;
  impact: string;
  keywordsAdded: string[];
}

// Section analysis
export interface SectionAnalysis {
  currentScore: number;
  issues: string[];
  improvements: SectionImprovement[] | BulletImprovement[];
}

// Skills section analysis
export interface SkillsAnalysis {
  currentScore: number;
  matched: string[];
  missing: string[];
  irrelevant: string[];
  reorder: string;
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
  honestAssessment?: string;
  competitorComparison?: string;
  // Enhanced detailed recommendations
  detailedRecommendations?: {
    criticalIssues: DetailedRecommendation[];
    missingKeywordDetails: MissingKeywordDetail[];
    sectionBySection: {
      summary?: SectionAnalysis;
      experience?: SectionAnalysis;
      skills?: SkillsAnalysis;
      education?: SectionAnalysis;
    };
  };
  quickWins?: string[];
  actionPlan?: {
    step1: string;
    step2: string;
    step3: string;
    estimatedScoreAfterFixes: string;
  };
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
  matchStrength: 'strong' | 'moderate' | 'weak' | 'poor';
  matchedKeywords: string[];
  missingKeywords: string[];
  atsScore: number;
  atsDetails: ATSAnalysis;
  truthGuardWarnings: TruthGuardWarning[];
  beforeAfterComparisons?: BeforeAfterComparison[];
  keywordDensity?: KeywordDensity;
  optimizationSummary?: OptimizationSummary;
}

// Truth Guard Warning
export interface TruthGuardWarning {
  type: 'fabrication' | 'inflation' | 'title_inflation' | 'invented_experience' | 'exaggeration' | 'inconsistency' | 'unsupported_claim';
  section: string;
  original: string;
  tailored?: string;
  concern: string;
  severity: 'low' | 'medium' | 'high';
  recommendation?: string;
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
export type AIProvider = 'openai';

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
