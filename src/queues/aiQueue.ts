import { createQueue, jobOptions } from './config';
import { PrismaClient } from '@prisma/client';
import { cacheService, CACHE_PREFIXES, CACHE_TTL } from '../services/cache';
import * as crypto from 'crypto';
import { Job } from 'bull';
import { deductAICredit } from '../middleware/credits';

const prisma = new PrismaClient();

// AI job types
export enum AIJobType {
  RESUME_TAILOR = 'resume_tailor',
  COVER_LETTER = 'cover_letter',
  ATS_ANALYSIS = 'ats_analysis',
  RESUME_PARSE = 'resume_parse',
  INTERVIEW_PREP = 'interview_prep',
  FOLLOW_UP_EMAIL = 'follow_up_email',
  NETWORKING_MESSAGE = 'networking_message',
}

// AI job data interface
export interface AIJobData {
  type: AIJobType;
  userId: string;
  payload: any;
  priority?: number;
  cacheKey?: string;
}

// Create AI processing queue
export const aiQueue = createQueue('ai-processing', {
  limiter: {
    max: 10, // Max 10 jobs per minute
    duration: 60000,
  },
});

// Helper function to generate cache key for AI results
function generateCacheKey(type: AIJobType, payload: any): string {
  const hash = crypto
    .createHash('md5')
    .update(JSON.stringify({ type, payload }))
    .digest('hex');
  return `${type}:${hash}`;
}

// Process AI jobs
aiQueue.process(async (job: Job<AIJobData>) => {
  const { type, userId, payload, cacheKey } = job.data;

  // Check cache first if cacheKey is provided
  if (cacheKey) {
    const cached = await cacheService.get(cacheKey, {
      prefix: CACHE_PREFIXES.AI_RESULT,
    });

    if (cached) {
      console.log(`AI job ${job.id} served from cache`);
      return cached;
    }
  }

  const startTime = Date.now();

  try {
    let result: any;

    switch (type) {
      case AIJobType.RESUME_TAILOR:
        result = await processResumeTailor(payload, userId);
        break;

      case AIJobType.COVER_LETTER:
        result = await processCoverLetter(payload, userId);
        break;

      case AIJobType.ATS_ANALYSIS:
        result = await processATSAnalysis(payload, userId);
        break;

      case AIJobType.RESUME_PARSE:
        result = await processResumeParse(payload, userId);
        break;

      case AIJobType.INTERVIEW_PREP:
        result = await processInterviewPrep(payload, userId);
        break;

      case AIJobType.FOLLOW_UP_EMAIL:
        result = await processFollowUpEmail(payload, userId);
        break;

      case AIJobType.NETWORKING_MESSAGE:
        result = await processNetworkingMessage(payload, userId);
        break;

      default:
        throw new Error(`Unknown AI job type: ${type}`);
    }

    const durationMs = Date.now() - startTime;

    // Cache the result if cacheKey is provided
    if (cacheKey) {
      await cacheService.set(cacheKey, result, {
        prefix: CACHE_PREFIXES.AI_RESULT,
        ttl: CACHE_TTL.LONG, // 30 minutes
      });
    }

    // Deduct one AI credit from user (5 lifetime credits)
    await deductAICredit(userId);

    console.log(`AI job ${job.id} (${type}) completed in ${durationMs}ms - 1 credit deducted`);
    return result;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    // Log AI usage error
    await prisma.aIUsageLog.create({
      data: {
        userId,
        operation: type,
        provider: 'openai',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
        durationMs,
        success: false,
        errorMessage: error.message,
      },
    });

    throw error;
  }
});

// AI processing functions (these would call the actual AI service)
async function processResumeTailor(payload: any, userId: string): Promise<any> {
  // Import AI service dynamically to avoid circular dependencies
  const { customizeResume } = await import('../services/ai');
  return await customizeResume(
    payload.resumeData,
    payload.resumeText || JSON.stringify(payload.resumeData),
    payload.jobData,
    payload.jobTitle || payload.jobData?.title || 'Position',
    payload.companyName || payload.jobData?.company || 'Company',
    userId,
    payload.organizationId,
    payload.jobDescription || payload.jobData?.description
  );
}

async function processCoverLetter(payload: any, userId: string): Promise<any> {
  const { generateCoverLetter } = await import('../services/ai');
  return await generateCoverLetter(
    {
      resumeData: payload.resumeData,
      jobData: payload.jobData,
      jobTitle: payload.jobData?.title || payload.jobTitle,
      companyName: payload.jobData?.company || payload.companyName,
      jobDescription: payload.jobData?.description || payload.jobDescription,
      tone: payload.tone || 'professional'
    },
    userId,
    payload.organizationId
  );
}

async function processATSAnalysis(payload: any, userId: string): Promise<any> {
  const { analyzeATS } = await import('../services/ai');
  // Extract keywords from job description (simple implementation)
  const jobKeywords = payload.jobDescription
    ? payload.jobDescription.split(/\s+/).filter((word: string) => word.length > 3)
    : [];
  return await analyzeATS(
    payload.resumeText,
    jobKeywords,
    userId
  );
}

async function processResumeParse(payload: any, userId: string): Promise<any> {
  // Resume parsing is handled by document queue
  // This is a placeholder for AI-enhanced parsing if needed
  return { success: true, message: 'Use document queue for parsing' };
}

async function processInterviewPrep(payload: any, userId: string): Promise<any> {
  // Placeholder for interview prep functionality
  // This would generate interview questions based on job description
  return {
    questions: [],
    message: 'Interview prep not yet implemented in AI service'
  };
}

async function processFollowUpEmail(payload: any, userId: string): Promise<any> {
  const { generateFollowUpEmail } = await import('../services/ai');
  return await generateFollowUpEmail(
    payload.type,
    {
      recipientName: payload.recipientName,
      companyName: payload.companyName,
      jobTitle: payload.jobTitle,
      interviewDate: payload.interviewDate,
      ...payload.context
    },
    payload.interviewContext,
    payload.resumeData
  );
}

async function processNetworkingMessage(payload: any, userId: string): Promise<any> {
  const { generateNetworkingMessage } = await import('../services/ai');
  return await generateNetworkingMessage(
    payload.recipientName,
    payload.recipientRole,
    payload.companyName,
    payload.context,
    payload.resumeData
  );
}

// Event listeners
aiQueue.on('completed', (job: Job<AIJobData>, result: any) => {
  console.log(`AI job ${job.id} completed successfully`);
});

aiQueue.on('failed', (job: Job<AIJobData>, err: Error) => {
  console.error(`AI job ${job.id} failed:`, err.message);
});

aiQueue.on('error', (error: Error) => {
  console.error('AI queue error:', error);
});

aiQueue.on('stalled', (job: Job<AIJobData>) => {
  console.warn(`AI job ${job.id} stalled`);
});

// Helper function to add AI job to queue with caching
export const processAIAsync = async (
  type: AIJobType,
  userId: string,
  payload: any,
  options: { priority?: number; useCache?: boolean } = {}
): Promise<any> => {
  const { priority = 0, useCache = true } = options;

  // Generate cache key if caching is enabled
  const cacheKey = useCache ? generateCacheKey(type, payload) : undefined;

  // Check cache before adding to queue
  if (cacheKey) {
    const cached = await cacheService.get(cacheKey, {
      prefix: CACHE_PREFIXES.AI_RESULT,
    });

    if (cached) {
      console.log(`AI request served from cache: ${type}`);
      return cached;
    }
  }

  // Add job to queue
  const job = await aiQueue.add(
    {
      type,
      userId,
      payload,
      priority,
      cacheKey,
    },
    {
      ...jobOptions.ai,
      priority,
    }
  );

  // Wait for job to complete
  const result = await job.finished();
  return result;
};

// Helper functions for specific AI operations
export const tailorResumeAsync = async (
  userId: string,
  payload: any
): Promise<any> => {
  return processAIAsync(AIJobType.RESUME_TAILOR, userId, payload);
};

export const generateCoverLetterAsync = async (
  userId: string,
  payload: any
): Promise<any> => {
  return processAIAsync(AIJobType.COVER_LETTER, userId, payload);
};

export const analyzeATSAsync = async (
  userId: string,
  payload: any
): Promise<any> => {
  return processAIAsync(AIJobType.ATS_ANALYSIS, userId, payload, {
    useCache: true, // ATS analysis is expensive, cache it
  });
};

export default aiQueue;
