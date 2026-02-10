import { Request } from 'express';
import { UserRole, PlanType } from '@prisma/client';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: UserRole;
        organizationId?: string | null;
        planType: PlanType;
    };
}
export interface SkillCategory {
    category: string;
    items: string[];
}
export interface PublicationEntry {
    title: string;
    authors?: string[];
    venue: string;
    year: string;
    citations?: number;
    awards?: string[];
    type?: string;
}
export interface LeadershipEntry {
    role: string;
    organization: string;
    period: string;
    highlights?: string[];
}
export interface ParsedResumeData {
    summary?: string;
    experience: ExperienceEntry[];
    education: EducationEntry[];
    skills: string[] | SkillCategory[];
    certifications?: CertificationEntry[];
    projects?: ProjectEntry[];
    languages?: string[];
    awards?: AwardEntry[] | string[];
    contact: ContactInfo;
    photoUrl?: string;
    publications?: (string | PublicationEntry)[];
    leadership?: (string | LeadershipEntry)[];
    achievements?: string[];
    professionalAffiliations?: string[];
    grants?: string[];
    speaking?: string[];
    volunteerWork?: string[];
}
export interface ExperienceEntry {
    title?: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string[];
    position?: string;
    highlights?: string[];
}
export interface EducationEntry {
    degree: string;
    institution: string;
    location?: string;
    graduationDate?: string;
    gpa?: string;
    achievements?: string[];
    honors?: string | string[];
    thesis?: string;
    advisor?: string;
    relevantCoursework?: string[];
}
export interface ProjectEntry {
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
    link?: string;
    company?: string;
    dates?: string;
    highlights?: string[];
}
export interface CertificationEntry {
    name: string;
    issuer?: string;
    date?: string;
    status?: string;
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
    portfolio?: string;
    photoUrl?: string;
}
export interface JobData {
    requiredSkills: string[];
    preferredSkills: string[];
    responsibilities: string[];
    keywords: string[];
    qualifications: string[];
    companyInfo?: string;
}
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
export interface MissingKeywordDetail {
    keyword: string;
    importance: string;
    suggestedLocation: string;
    exampleUsage: string;
    relatedKeywords: string[];
    currentGap: string;
}
export interface SectionImprovement {
    change: string;
    before: string;
    after: string;
    impact: string;
}
export interface BulletImprovement {
    bulletPoint: string;
    weaknesses: string[];
    enhanced: string;
    impact: string;
    keywordsAdded: string[];
}
export interface SectionAnalysis {
    currentScore: number;
    issues: string[];
    improvements: SectionImprovement[] | BulletImprovement[];
}
export interface SkillsAnalysis {
    currentScore: number;
    matched: string[];
    missing: string[];
    irrelevant: string[];
    reorder: string;
}
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
export interface BeforeAfterComparison {
    section: string;
    before: string;
    after: string;
    improvement: string;
    impactLevel: 'High' | 'Medium' | 'Low';
}
export interface KeywordDensity {
    before: number;
    after: number;
    improvement: string;
}
export interface OptimizationSummary {
    sectionsOptimized: number;
    keywordsAdded: number;
    bulletPointsEnhanced: number;
    estimatedATSImprovement: string;
}
export interface CustomizationResult {
    tailoredData: ParsedResumeData;
    tailoredText: string;
    changesExplanation: string;
    matchedKeywords: string[];
    missingKeywords: string[];
    atsScore: number;
    atsDetails: ATSAnalysis;
    truthGuardWarnings: TruthGuardWarning[];
    beforeAfterComparisons?: BeforeAfterComparison[];
    keywordDensity?: KeywordDensity;
    optimizationSummary?: OptimizationSummary;
}
export interface TruthGuardWarning {
    type: 'exaggeration' | 'inconsistency' | 'unsupported_claim';
    section: string;
    original: string;
    concern: string;
    severity: 'low' | 'medium' | 'high';
}
export interface CoverLetterInput {
    resumeData: ParsedResumeData;
    jobData: JobData;
    jobTitle: string;
    companyName: string;
    tone?: 'professional' | 'enthusiastic' | 'formal';
}
export interface AnonymizationConfig {
    maskName: boolean;
    maskEmail: boolean;
    maskPhone: boolean;
    maskLocation: boolean;
    maskCompanyNames: boolean;
}
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
export interface SubscriptionLimits {
    maxResumes: number;
    maxVersionsPerResume: number;
    coverLettersEnabled: boolean;
    atsSimulatorEnabled: boolean;
    customTemplatesEnabled: boolean;
    anonymizationEnabled: boolean;
}
export type AIProvider = 'groq';
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
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
//# sourceMappingURL=index.d.ts.map