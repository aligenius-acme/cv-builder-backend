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
export interface ParsedResumeData {
    summary?: string;
    experience: ExperienceEntry[];
    education: EducationEntry[];
    skills: string[];
    certifications?: string[];
    projects?: ProjectEntry[];
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
export interface JobData {
    requiredSkills: string[];
    preferredSkills: string[];
    responsibilities: string[];
    keywords: string[];
    qualifications: string[];
    companyInfo?: string;
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
export type AIProvider = 'openai' | 'anthropic' | 'grok';
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