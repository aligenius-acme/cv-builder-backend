import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest, ParsedResumeData } from '../types';
import { ValidationError, NotFoundError, QuotaExceededError } from '../utils/errors';
import { uploadFile, deleteFile, getPresignedDownloadUrl } from '../services/storage';
import { parseFile, extractResumeData, logParsingError } from '../services/parser';
import { fullCustomizationPipeline, analyzeATS } from '../services/ai';
import { generatePDF, generateDOCX, anonymizeResumeData } from '../services/documents';
import { getTemplate, isValidTemplate } from '../services/templates';
import { getSubscriptionLimits } from '../middleware/subscription';

// Upload and parse resume
export const uploadResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      throw new ValidationError('Resume file is required');
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new ValidationError('Only PDF and DOCX files are allowed');
    }

    // Check quota
    const limits = getSubscriptionLimits(req.user!.planType);
    if (limits.maxResumes !== -1) {
      const resumeCount = await prisma.resume.count({
        where: { userId },
      });

      if (resumeCount >= limits.maxResumes) {
        throw new QuotaExceededError(
          `Resume limit reached (${limits.maxResumes}). Upgrade to Pro for more resumes.`
        );
      }
    }

    // Upload to S3
    const { key, url } = await uploadFile(
      file.buffer,
      file.originalname,
      userId,
      'resumes',
      file.mimetype
    );

    // Create resume record with pending status
    const resume = await prisma.resume.create({
      data: {
        userId,
        originalFileName: file.originalname,
        originalFileUrl: url,
        originalFileKey: key,
        rawText: '',
        parsedData: {},
        parseStatus: 'processing',
      },
    });

    // Parse file asynchronously
    try {
      const rawText = await parseFile(file.buffer, file.originalname);
      const parsedData = await extractResumeData(rawText);

      await prisma.resume.update({
        where: { id: resume.id },
        data: {
          rawText,
          parsedData: parsedData as any,
          parseStatus: 'completed',
        },
      });

      // Update subscription usage
      await prisma.subscription.update({
        where: { userId },
        data: {
          resumesCreated: { increment: 1 },
        },
      });

      res.status(201).json({
        success: true,
        data: {
          id: resume.id,
          fileName: file.originalname,
          parseStatus: 'completed',
          parsedData,
        },
      });
    } catch (parseError) {
      // Log parsing error but don't block
      await logParsingError(
        file.originalname,
        file.mimetype,
        parseError as Error,
        resume.id,
        userId
      );

      await prisma.resume.update({
        where: { id: resume.id },
        data: {
          parseStatus: 'failed',
          parseError: (parseError as Error).message,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          id: resume.id,
          fileName: file.originalname,
          parseStatus: 'failed',
          parseError: (parseError as Error).message,
        },
        message: 'Resume uploaded but parsing failed. You can try re-uploading or manually edit.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get all resumes for user
export const getResumes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const resumes = await prisma.resume.findMany({
      where: { userId },
      include: {
        _count: {
          select: { versions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: resumes.map((resume) => ({
        id: resume.id,
        title: resume.title,
        fileName: resume.originalFileName,
        parseStatus: resume.parseStatus,
        versionCount: resume._count.versions,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Get single resume with details
export const getResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 10,
        },
      },
    });

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    res.json({
      success: true,
      data: {
        id: resume.id,
        title: resume.title,
        fileName: resume.originalFileName,
        parseStatus: resume.parseStatus,
        parseError: resume.parseError,
        parsedData: resume.parsedData,
        rawText: resume.rawText,
        versions: resume.versions.map((v) => ({
          id: v.id,
          versionNumber: v.versionNumber,
          jobTitle: v.jobTitle,
          companyName: v.companyName,
          atsScore: v.atsScore,
          createdAt: v.createdAt,
        })),
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update resume title
export const updateResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title } = req.body;

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    const updated = await prisma.resume.update({
      where: { id },
      data: { title },
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete resume
export const deleteResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      include: { versions: true },
    });

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    // Delete S3 files
    await deleteFile(resume.originalFileKey);

    for (const version of resume.versions) {
      if (version.pdfFileKey) await deleteFile(version.pdfFileKey);
      if (version.docxFileKey) await deleteFile(version.docxFileKey);
    }

    // Delete from database (cascades to versions)
    await prisma.resume.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Customize resume for job
export const customizeResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;
    const { id } = req.params;
    const { jobTitle, companyName, jobDescription } = req.body;

    if (!jobTitle || !companyName || !jobDescription) {
      throw new ValidationError('Job title, company name, and job description are required');
    }

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    if (resume.parseStatus !== 'completed') {
      throw new ValidationError('Resume parsing is not completed');
    }

    // Get next version number
    const latestVersion = await prisma.resumeVersion.findFirst({
      where: { resumeId: id },
      orderBy: { versionNumber: 'desc' },
    });

    const versionNumber = (latestVersion?.versionNumber || 0) + 1;

    // Run full customization pipeline
    const result = await fullCustomizationPipeline(
      resume.parsedData as unknown as ParsedResumeData,
      resume.rawText,
      jobDescription,
      jobTitle,
      companyName,
      userId,
      organizationId
    );

    // Create version
    const version = await prisma.resumeVersion.create({
      data: {
        resumeId: id,
        userId,
        versionNumber,
        jobTitle,
        companyName,
        jobDescription,
        jobData: result.atsDetails as any,
        tailoredData: result.tailoredData as any,
        tailoredText: result.tailoredText,
        changesExplanation: result.changesExplanation,
        matchedKeywords: result.matchedKeywords,
        missingKeywords: result.missingKeywords,
        atsScore: result.atsScore,
        atsDetails: result.atsDetails as any,
        truthGuardWarnings: result.truthGuardWarnings as any,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: version.id,
        versionNumber: version.versionNumber,
        jobTitle: version.jobTitle,
        companyName: version.companyName,
        atsScore: version.atsScore,
        matchedKeywords: version.matchedKeywords,
        missingKeywords: version.missingKeywords,
        changesExplanation: version.changesExplanation,
        truthGuardWarnings: version.truthGuardWarnings,
        createdAt: version.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get resume version details
export const getVersion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id, versionId } = req.params;

    const version = await prisma.resumeVersion.findFirst({
      where: { id: versionId, resumeId: id, userId },
      include: {
        resume: {
          select: {
            parsedData: true,
            title: true,
          },
        },
      },
    });

    if (!version) {
      throw new NotFoundError('Version not found');
    }

    res.json({
      success: true,
      data: {
        id: version.id,
        versionNumber: version.versionNumber,
        jobTitle: version.jobTitle,
        companyName: version.companyName,
        jobDescription: version.jobDescription,
        originalData: version.resume.parsedData,
        tailoredData: version.tailoredData,
        tailoredText: version.tailoredText,
        changesExplanation: version.changesExplanation,
        matchedKeywords: version.matchedKeywords,
        missingKeywords: version.missingKeywords,
        atsScore: version.atsScore,
        atsDetails: version.atsDetails,
        truthGuardWarnings: version.truthGuardWarnings,
        createdAt: version.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Compare versions (diff view)
export const compareVersions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { version1, version2 } = req.query;

    if (!version1 || !version2) {
      throw new ValidationError('Both version IDs are required');
    }

    const versions = await prisma.resumeVersion.findMany({
      where: {
        resumeId: id,
        userId,
        id: { in: [version1 as string, version2 as string] },
      },
    });

    if (versions.length !== 2) {
      throw new NotFoundError('One or both versions not found');
    }

    const v1 = versions.find((v) => v.id === version1);
    const v2 = versions.find((v) => v.id === version2);

    res.json({
      success: true,
      data: {
        version1: {
          id: v1!.id,
          versionNumber: v1!.versionNumber,
          jobTitle: v1!.jobTitle,
          companyName: v1!.companyName,
          tailoredData: v1!.tailoredData,
          atsScore: v1!.atsScore,
        },
        version2: {
          id: v2!.id,
          versionNumber: v2!.versionNumber,
          jobTitle: v2!.jobTitle,
          companyName: v2!.companyName,
          tailoredData: v2!.tailoredData,
          atsScore: v2!.atsScore,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Download resume version
export const downloadVersion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id, versionId } = req.params;
    const { format = 'pdf', anonymize = 'false', template = 'professional' } = req.query;

    const version = await prisma.resumeVersion.findFirst({
      where: { id: versionId, resumeId: id, userId },
      include: {
        user: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!version) {
      throw new NotFoundError('Version not found');
    }

    // Validate and get template
    const templateId = template as string;
    if (!isValidTemplate(templateId)) {
      throw new ValidationError(`Invalid template: ${templateId}`);
    }
    const templateConfig = getTemplate(templateId);

    let resumeData = version.tailoredData as unknown as ParsedResumeData;

    // Apply anonymization if requested and allowed
    if (anonymize === 'true' && version.user.organization?.anonymizationEnabled) {
      resumeData = anonymizeResumeData(resumeData, {
        maskName: true,
        maskEmail: true,
        maskPhone: true,
        maskLocation: true,
        maskCompanyNames: false,
      });
    }

    let buffer: Buffer;
    let contentType: string;
    let fileName: string;

    if (format === 'docx') {
      buffer = await generateDOCX(resumeData, templateConfig);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileName = `resume-v${version.versionNumber}-${version.companyName}.docx`;
    } else {
      buffer = await generatePDF(resumeData, templateConfig);
      contentType = 'application/pdf';
      fileName = `resume-v${version.versionNumber}-${version.companyName}.pdf`;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// Run ATS simulation on version
export const simulateATS = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const organizationId = req.user!.organizationId;
    const { id, versionId } = req.params;

    const version = await prisma.resumeVersion.findFirst({
      where: { id: versionId, resumeId: id, userId },
    });

    if (!version) {
      throw new NotFoundError('Version not found');
    }

    // Get job keywords from stored data
    const jobData = version.jobData as any;
    const keywords = [
      ...(jobData.requiredSkills || []),
      ...(jobData.keywords || []),
    ];

    // Run ATS analysis
    const atsResult = await analyzeATS(
      version.tailoredText,
      keywords,
      userId,
      organizationId
    );

    // Update version with new ATS details
    await prisma.resumeVersion.update({
      where: { id: versionId },
      data: {
        atsScore: atsResult.score,
        atsDetails: atsResult as any,
      },
    });

    res.json({
      success: true,
      data: {
        score: atsResult.score,
        keywordMatchPercentage: atsResult.keywordMatchPercentage,
        matchedKeywords: atsResult.matchedKeywords,
        missingKeywords: atsResult.missingKeywords,
        sectionScores: atsResult.sectionScores,
        formattingIssues: atsResult.formattingIssues,
        recommendations: atsResult.recommendations,
        atsExtractedView: atsResult.atsExtractedView,
        riskyElements: atsResult.riskyElements,
      },
    });
  } catch (error) {
    next(error);
  }
};
