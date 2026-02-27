import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest, ParsedResumeData, JobData } from '../types';
import { ValidationError, NotFoundError } from '../utils/errors';
import { generateCoverLetter as aiGenerateCoverLetter, generateEnhancedCoverLetter as aiGenerateEnhancedCoverLetter, analyzeJobDescription } from '../services/ai';
import { deductAICredit } from '../middleware/credits';
import { getGrammarlyUrl } from '../config/affiliateLinks';
import { generateCoverLetterPDF, generateCoverLetterDOCX } from '../services/documents';
import { uploadDocument } from '../services/storage';

// Generate cover letter
export const generateCoverLetter = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const organizationId = null;
    const { resumeVersionId, jobTitle, companyName, jobDescription, tone = 'professional' } = req.body;

    if (!jobTitle || !companyName || !jobDescription) {
      throw new ValidationError('Job title, company name, and job description are required');
    }

    let resumeData: ParsedResumeData;
    let jobData: JobData;

    // If resumeVersionId provided, use that version's tailored data
    if (resumeVersionId) {
      const version = await prisma.resumeVersion.findFirst({
        where: { id: resumeVersionId, userId },
      });

      if (!version) {
        throw new NotFoundError('Resume version not found');
      }

      resumeData = version.tailoredData as unknown as ParsedResumeData;
      // Use stored jobData if present, otherwise analyze the JD
      const storedJobData = version.jobData as unknown as JobData;
      const hasJobData = storedJobData && (storedJobData.requiredSkills?.length || storedJobData.keywords?.length);
      jobData = hasJobData ? storedJobData : await analyzeJobDescription(jobDescription, userId, organizationId);
    } else {
      // Use the most recent resume
      const resume = await prisma.resume.findFirst({
        where: { userId, parseStatus: 'completed' },
        orderBy: { createdAt: 'desc' },
      });

      if (!resume) {
        throw new NotFoundError('No parsed resume found. Please upload a resume first.');
      }

      resumeData = resume.parsedData as unknown as ParsedResumeData;
      // Always analyze the JD so AI has real job context
      jobData = await analyzeJobDescription(jobDescription, userId, organizationId);
    }

    // Generate cover letter using AI — pass both structured jobData and raw JD text
    const content = await aiGenerateCoverLetter(
      {
        resumeData,
        jobData,
        jobTitle,
        companyName,
        jobDescription,
        tone: tone as 'professional' | 'enthusiastic' | 'formal',
      },
      userId,
      organizationId
    );

    // Deduct one credit for this endpoint
    await deductAICredit(userId);

    // Save cover letter
    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId,
        resumeVersionId,
        jobTitle,
        companyName,
        jobDescription,
        content,
        tone,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: coverLetter.id,
        jobTitle: coverLetter.jobTitle,
        companyName: coverLetter.companyName,
        content: coverLetter.content,
        grammarlyUrl: await getGrammarlyUrl(),
        createdAt: coverLetter.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all cover letters
export const getCoverLetters = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const coverLetters = await prisma.coverLetter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: coverLetters.map((cl) => ({
        id: cl.id,
        jobTitle: cl.jobTitle,
        companyName: cl.companyName,
        tone: cl.tone,
        createdAt: cl.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Get single cover letter
export const getCoverLetter = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const coverLetter = await prisma.coverLetter.findFirst({
      where: { id, userId },
    });

    if (!coverLetter) {
      throw new NotFoundError('Cover letter not found');
    }

    res.json({
      success: true,
      data: {
        id: coverLetter.id,
        jobTitle: coverLetter.jobTitle,
        companyName: coverLetter.companyName,
        jobDescription: coverLetter.jobDescription,
        content: coverLetter.content,
        tone: coverLetter.tone,
        createdAt: coverLetter.createdAt,
        updatedAt: coverLetter.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update cover letter content
export const updateCoverLetter = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { content } = req.body;

    const coverLetter = await prisma.coverLetter.findFirst({
      where: { id, userId },
    });

    if (!coverLetter) {
      throw new NotFoundError('Cover letter not found');
    }

    const updated = await prisma.coverLetter.update({
      where: { id },
      data: { content },
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        content: updated.content,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete cover letter
export const deleteCoverLetter = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const coverLetter = await prisma.coverLetter.findFirst({
      where: { id, userId },
    });

    if (!coverLetter) {
      throw new NotFoundError('Cover letter not found');
    }

    await prisma.coverLetter.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Cover letter deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Download cover letter
export const downloadCoverLetter = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { format = 'pdf' } = req.query;

    const coverLetter = await prisma.coverLetter.findFirst({
      where: { id, userId },
      include: {
        user: true,
      },
    });

    if (!coverLetter) {
      throw new NotFoundError('Cover letter not found');
    }

    const candidateName = `${coverLetter.user.firstName || ''} ${coverLetter.user.lastName || ''}`.trim() || 'Candidate';

    let buffer: Buffer;
    let contentType: string;
    let fileName: string;

    if (format === 'docx') {
      buffer = await generateCoverLetterDOCX(
        coverLetter.content,
        candidateName,
        coverLetter.companyName,
        coverLetter.jobTitle
      );
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileName = `cover-letter-${coverLetter.companyName}.docx`;
    } else {
      buffer = await generateCoverLetterPDF(
        coverLetter.content,
        candidateName,
        coverLetter.companyName,
        coverLetter.jobTitle
      );
      contentType = 'application/pdf';
      fileName = `cover-letter-${coverLetter.companyName}.pdf`;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// Regenerate cover letter with different parameters
export const regenerateCoverLetter = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const organizationId = null;
    const { id } = req.params;
    const { tone = 'professional' } = req.body;

    const coverLetter = await prisma.coverLetter.findFirst({
      where: { id, userId },
    });

    if (!coverLetter) {
      throw new NotFoundError('Cover letter not found');
    }

    // Get resume data
    let resumeData: ParsedResumeData;
    let jobData: JobData;

    if (coverLetter.resumeVersionId) {
      const version = await prisma.resumeVersion.findFirst({
        where: { id: coverLetter.resumeVersionId },
      });

      if (version) {
        resumeData = version.tailoredData as unknown as ParsedResumeData;
        const storedJobData = version.jobData as unknown as JobData;
        const hasJobData = storedJobData && (storedJobData.requiredSkills?.length || storedJobData.keywords?.length);
        jobData = hasJobData
          ? storedJobData
          : await analyzeJobDescription(coverLetter.jobDescription, userId, organizationId);
      } else {
        throw new NotFoundError('Associated resume version not found');
      }
    } else {
      const resume = await prisma.resume.findFirst({
        where: { userId, parseStatus: 'completed' },
        orderBy: { createdAt: 'desc' },
      });

      if (!resume) {
        throw new NotFoundError('No parsed resume found');
      }

      resumeData = resume.parsedData as unknown as ParsedResumeData;
      // Re-analyze the stored JD so regeneration has the same job context as original
      jobData = await analyzeJobDescription(coverLetter.jobDescription, userId, organizationId);
    }

    // Generate new content — pass both structured jobData and original raw JD text
    const content = await aiGenerateCoverLetter(
      {
        resumeData,
        jobData,
        jobTitle: coverLetter.jobTitle,
        companyName: coverLetter.companyName,
        jobDescription: coverLetter.jobDescription,
        tone: tone as 'professional' | 'enthusiastic' | 'formal',
      },
      userId,
      organizationId
    );

    // Deduct one credit for this endpoint
    await deductAICredit(userId);

    // Update cover letter
    const updated = await prisma.coverLetter.update({
      where: { id },
      data: { content, tone },
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        content: updated.content,
        tone: updated.tone,
        grammarlyUrl: await getGrammarlyUrl(),
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Generate enhanced cover letter with alternatives
export const generateEnhancedCoverLetter = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const organizationId = null;
    const { resumeVersionId, jobTitle, companyName, jobDescription, tone = 'professional' } = req.body;

    if (!jobTitle || !companyName || !jobDescription) {
      throw new ValidationError('Job title, company name, and job description are required');
    }

    let resumeData: ParsedResumeData;
    let jobData: JobData;

    // If resumeVersionId provided, use that version's tailored data
    if (resumeVersionId) {
      const version = await prisma.resumeVersion.findFirst({
        where: { id: resumeVersionId, userId },
      });

      if (!version) {
        throw new NotFoundError('Resume version not found');
      }

      resumeData = version.tailoredData as unknown as ParsedResumeData;
      const storedJobData = version.jobData as unknown as JobData;
      const hasJobData = storedJobData && (storedJobData.requiredSkills?.length || storedJobData.keywords?.length);
      jobData = hasJobData ? storedJobData : await analyzeJobDescription(jobDescription, userId, organizationId);
    } else {
      // Use the most recent resume
      const resume = await prisma.resume.findFirst({
        where: { userId, parseStatus: 'completed' },
        orderBy: { createdAt: 'desc' },
      });

      if (!resume) {
        throw new NotFoundError('No parsed resume found. Please upload a resume first.');
      }

      resumeData = resume.parsedData as unknown as ParsedResumeData;
      // Always analyze the JD so AI has real job context
      jobData = await analyzeJobDescription(jobDescription, userId, organizationId);
    }

    // Generate enhanced cover letter using AI — pass both structured jobData and raw JD text
    const result = await aiGenerateEnhancedCoverLetter(
      {
        resumeData,
        jobData,
        jobTitle,
        companyName,
        jobDescription,
        tone: tone as 'professional' | 'enthusiastic' | 'formal',
      },
      userId,
      organizationId
    );

    // Deduct one credit for this endpoint
    await deductAICredit(userId);

    // Save cover letter
    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId,
        resumeVersionId,
        jobTitle,
        companyName,
        jobDescription,
        content: result.content,
        tone,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: coverLetter.id,
        jobTitle: coverLetter.jobTitle,
        companyName: coverLetter.companyName,
        content: result.content,
        alternativeOpenings: result.alternativeOpenings,
        keyPhrases: result.keyPhrases,
        toneAnalysis: result.toneAnalysis,
        callToActionVariations: result.callToActionVariations,
        subjectLineOptions: result.subjectLineOptions,
        grammarlyUrl: await getGrammarlyUrl(),
        createdAt: coverLetter.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
