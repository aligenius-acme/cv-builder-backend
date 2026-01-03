import { ParsedResumeData, JobData, ATSAnalysis, CustomizationResult, TruthGuardWarning, CoverLetterInput } from '../types';
export declare function analyzeJobDescription(jobDescription: string, userId: string, organizationId?: string | null): Promise<JobData>;
export declare function customizeResume(resumeData: ParsedResumeData, jobData: JobData, jobTitle: string, companyName: string, userId: string, organizationId?: string | null): Promise<Omit<CustomizationResult, 'atsScore' | 'atsDetails' | 'truthGuardWarnings'>>;
export declare function analyzeATS(resumeText: string, jobKeywords: string[], userId: string, organizationId?: string | null): Promise<ATSAnalysis>;
export declare function runTruthGuard(originalData: ParsedResumeData, tailoredData: ParsedResumeData, userId: string, organizationId?: string | null): Promise<TruthGuardWarning[]>;
export declare function generateCoverLetter(input: CoverLetterInput, userId: string, organizationId?: string | null): Promise<string>;
export declare function fullCustomizationPipeline(resumeData: ParsedResumeData, resumeText: string, jobDescription: string, jobTitle: string, companyName: string, userId: string, organizationId?: string | null): Promise<CustomizationResult>;
//# sourceMappingURL=ai.d.ts.map