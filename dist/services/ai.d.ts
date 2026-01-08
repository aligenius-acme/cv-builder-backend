import { ParsedResumeData, JobData, ATSAnalysis, CustomizationResult, TruthGuardWarning, CoverLetterInput } from '../types';
export declare function analyzeJobDescription(jobDescription: string, userId: string, organizationId?: string | null): Promise<JobData>;
export declare function customizeResume(resumeData: ParsedResumeData, resumeText: string, jobData: JobData, jobTitle: string, companyName: string, userId: string, organizationId?: string | null): Promise<Omit<CustomizationResult, 'atsScore' | 'atsDetails' | 'truthGuardWarnings'>>;
export declare function analyzeATS(resumeText: string, jobKeywords: string[], userId: string, organizationId?: string | null): Promise<ATSAnalysis>;
export declare function runTruthGuard(originalData: ParsedResumeData, tailoredData: ParsedResumeData, userId: string, organizationId?: string | null): Promise<TruthGuardWarning[]>;
export declare function generateCoverLetter(input: CoverLetterInput, userId: string, organizationId?: string | null): Promise<string>;
export declare function fullCustomizationPipeline(resumeData: ParsedResumeData, resumeText: string, jobDescription: string, jobTitle: string, companyName: string, userId: string, organizationId?: string | null): Promise<CustomizationResult>;
export interface JobMatchResult {
    overallScore: number;
    breakdown: {
        skillsMatch: number;
        experienceMatch: number;
        educationMatch: number;
        keywordsMatch: number;
    };
    strengths: string[];
    gaps: string[];
    verdict: 'Strong Match' | 'Good Match' | 'Moderate Match' | 'Weak Match';
    recommendation: string;
    timeToApply: string;
}
export declare function calculateJobMatchScore(resumeData: ParsedResumeData, jobDescription: string, jobTitle: string, userId: string, organizationId?: string | null): Promise<JobMatchResult>;
export interface QuantifiedAchievement {
    original: string;
    quantified: string;
    addedMetrics: string[];
    impactLevel: 'High' | 'Medium' | 'Low';
    suggestions: string[];
}
export interface AchievementQuantifierResult {
    achievements: QuantifiedAchievement[];
    overallImprovement: string;
    tips: string[];
}
export declare function quantifyAchievements(bullets: string[], jobContext?: string, userId?: string, organizationId?: string | null): Promise<AchievementQuantifierResult>;
export interface ResumeWeakness {
    issue: string;
    location: string;
    severity: 'Critical' | 'Major' | 'Minor';
    impact: string;
    fix: string;
    example?: string;
}
export interface WeaknessDetectorResult {
    weaknesses: ResumeWeakness[];
    overallHealth: 'Excellent' | 'Good' | 'Needs Work' | 'Critical Issues';
    healthScore: number;
    prioritizedActions: string[];
    positives: string[];
}
export declare function detectWeaknesses(resumeData: ParsedResumeData, resumeText: string, targetRole?: string, userId?: string, organizationId?: string | null): Promise<WeaknessDetectorResult>;
export interface FollowUpEmailResult {
    subject: string;
    body: string;
    timing: string;
    tips: string[];
    alternativeSubjects: string[];
}
export type FollowUpType = 'thank_you' | 'post_interview' | 'no_response' | 'after_rejection' | 'networking';
export declare function generateFollowUpEmail(type: FollowUpType, context: {
    recipientName?: string;
    recipientTitle?: string;
    companyName: string;
    jobTitle: string;
    interviewDate?: string;
    interviewDetails?: string;
    candidateName: string;
    keyPoints?: string[];
}, userId: string, organizationId?: string | null): Promise<FollowUpEmailResult>;
export interface NetworkingMessageResult {
    message: string;
    platform: string;
    approach: string;
    followUpMessage?: string;
    tips: string[];
    personalizationPoints: string[];
}
export type NetworkingPlatform = 'linkedin' | 'email' | 'twitter';
export type NetworkingPurpose = 'job_inquiry' | 'informational_interview' | 'referral_request' | 'reconnection' | 'cold_outreach';
export declare function generateNetworkingMessage(platform: NetworkingPlatform, purpose: NetworkingPurpose, context: {
    senderName: string;
    senderBackground: string;
    recipientName: string;
    recipientTitle: string;
    recipientCompany: string;
    commonGround?: string[];
    targetRole?: string;
    specificAsk?: string;
}, userId: string, organizationId?: string | null): Promise<NetworkingMessageResult>;
//# sourceMappingURL=ai.d.ts.map