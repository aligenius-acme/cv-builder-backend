import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import * as aiService from '../services/ai';
import { ValidationError } from '../utils/errors';
import { prisma } from '../utils/prisma';
import { deductAICredit } from '../middleware/credits';
import { getAffiliateCourses } from '../config/affiliateLinks';

// Calculate Job Match Score
export const calculateJobMatch = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resumeId, jobDescription, jobTitle } = req.body;
    const userId = req.user!.id;

    if (!resumeId || !jobDescription || !jobTitle) {
      throw new ValidationError('Resume ID, job description, and job title are required');
    }

    // Get resume data
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
    });

    if (!resume) {
      throw new ValidationError('Resume not found');
    }

    const resumeData = resume.parsedData as any;
    if (!resumeData) {
      throw new ValidationError('Resume has not been parsed yet');
    }

    const result = await aiService.calculateJobMatchScore(
      resumeData,
      jobDescription,
      jobTitle,
      userId,
      null
    );

    await deductAICredit(userId, req);

    const courseRecommendations = await getAffiliateCourses((result as any).missingKeywords || []);

    res.json({
      success: true,
      data: { ...result, courseRecommendations },
    });
  } catch (error) {
    next(error);
  }
};

// Quantify Achievements
export const quantifyAchievements = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bullets, jobContext } = req.body;
    const userId = req.user!.id;

    if (!bullets || !Array.isArray(bullets) || bullets.length === 0) {
      throw new ValidationError('Bullets array is required');
    }

    if (bullets.length > 20) {
      throw new ValidationError('Maximum 20 bullet points allowed at once');
    }

    // Validate each bullet is a non-empty string
    const validBullets = bullets.filter((b: any) => typeof b === 'string' && b.trim().length > 0);
    if (validBullets.length === 0) {
      throw new ValidationError('At least one valid bullet point is required');
    }

    const result = await aiService.quantifyAchievements(
      validBullets,
      jobContext,
      userId,
      null
    );

    await deductAICredit(userId, req);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Detect Resume Weaknesses
export const detectWeaknesses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resumeId, targetRole } = req.body;
    const userId = req.user!.id;

    if (!resumeId) {
      throw new ValidationError('Resume ID is required');
    }

    // Get resume data
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId,
      },
    });

    if (!resume) {
      throw new ValidationError('Resume not found');
    }

    const resumeData = resume.parsedData as any;
    const resumeText = resume.rawText || '';

    if (!resumeData) {
      throw new ValidationError('Resume has not been parsed yet');
    }

    const result = await aiService.detectWeaknesses(
      resumeData,
      resumeText,
      targetRole,
      userId,
      null
    );

    await deductAICredit(userId, req);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Generate Follow-up Email
export const generateFollowUpEmail = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      type,
      recipientName,
      recipientTitle,
      companyName,
      jobTitle,
      interviewDate,
      interviewDetails,
      candidateName,
      keyPoints,
      resumeId,
    } = req.body;
    const userId = req.user!.id;

    if (!type || !companyName || !jobTitle || !candidateName) {
      throw new ValidationError('Type, company name, job title, and candidate name are required');
    }

    const validTypes: aiService.FollowUpType[] = [
      'thank_you',
      'post_interview',
      'no_response',
      'after_rejection',
      'networking',
    ];

    if (!validTypes.includes(type)) {
      throw new ValidationError(`Type must be one of: ${validTypes.join(', ')}`);
    }

    // Optionally fetch resume for richer AI context
    let resumeData: any = undefined;
    if (resumeId) {
      const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
      if (resume?.parsedData) resumeData = resume.parsedData;
    }

    const result = await aiService.generateFollowUpEmail(
      type,
      {
        recipientName,
        recipientTitle,
        companyName,
        jobTitle,
        interviewDate,
        interviewDetails,
        candidateName,
        keyPoints,
        resumeData,
      },
      userId,
      null
    );

    await deductAICredit(userId, req);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Generate Networking Message
export const generateNetworkingMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      platform,
      purpose,
      senderName,
      senderBackground,
      recipientName,
      recipientTitle,
      recipientCompany,
      commonGround,
      targetRole,
      specificAsk,
      resumeId,
    } = req.body;
    const userId = req.user!.id;

    if (!platform || !purpose || !senderName || !senderBackground || !recipientName || !recipientTitle || !recipientCompany) {
      throw new ValidationError('Platform, purpose, sender info, and recipient info are required');
    }

    const validPlatforms: aiService.NetworkingPlatform[] = ['linkedin', 'email', 'twitter'];
    const validPurposes: aiService.NetworkingPurpose[] = [
      'job_inquiry',
      'informational_interview',
      'referral_request',
      'reconnection',
      'cold_outreach',
    ];

    if (!validPlatforms.includes(platform)) {
      throw new ValidationError(`Platform must be one of: ${validPlatforms.join(', ')}`);
    }

    if (!validPurposes.includes(purpose)) {
      throw new ValidationError(`Purpose must be one of: ${validPurposes.join(', ')}`);
    }

    // Optionally fetch resume for richer AI context
    let resumeData: any = undefined;
    if (resumeId) {
      const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
      if (resume?.parsedData) resumeData = resume.parsedData;
    }

    const result = await aiService.generateNetworkingMessage(
      platform,
      purpose,
      {
        senderName,
        senderBackground,
        recipientName,
        recipientTitle,
        recipientCompany,
        commonGround,
        targetRole,
        specificAsk,
        resumeData,
      },
      userId,
      null
    );

    await deductAICredit(userId, req);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Quick job match from job tracker
export const quickJobMatch = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { resumeId } = req.query;
    const userId = req.user!.id;

    if (!jobId) {
      throw new ValidationError('Job ID is required');
    }

    // Get job from tracker
    const job = await prisma.jobApplication.findFirst({
      where: {
        id: jobId,
        userId,
      },
    });

    if (!job) {
      throw new ValidationError('Job not found');
    }

    // Get resume (use provided or find most recent)
    let resume;
    if (resumeId) {
      resume = await prisma.resume.findFirst({
        where: {
          id: resumeId as string,
          userId,
        },
      });
    } else {
      resume = await prisma.resume.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });
    }

    if (!resume) {
      throw new ValidationError('No resume found. Please upload a resume first.');
    }

    const resumeData = resume.parsedData as any;
    if (!resumeData) {
      throw new ValidationError('Resume has not been parsed yet');
    }

    const result = await aiService.calculateJobMatchScore(
      resumeData,
      job.jobDescription || '',
      job.jobTitle,
      userId,
      null
    );

    await deductAICredit(userId, req);

    const courseRecommendations = await getAffiliateCourses((result as any).missingKeywords || []);

    res.json({
      success: true,
      data: {
        ...result,
        courseRecommendations,
        jobId: job.id,
        jobTitle: job.jobTitle,
        company: job.companyName,
        resumeId: resume.id,
        resumeName: resume.title || resume.originalFileName,
      },
    });
  } catch (error) {
    next(error);
  }
};
