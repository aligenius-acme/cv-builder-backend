import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';
import { AuthenticatedRequest, ParsedResumeData, ATSAnalysis } from '../types';
import { ValidationError, NotFoundError, QuotaExceededError } from '../utils/errors';
import { uploadFile, deleteFile, getFile } from '../services/storage';
import { parseFile, extractResumeData, logParsingError } from '../services/parser';
import { fullCustomizationPipeline, analyzeATS, generateResumeText } from '../services/ai';
import { deductAICredit } from '../middleware/credits';
import { getAffiliateCourses } from '../config/affiliateLinks';
import { generatePDF, generateDOCX, generatePDFFromRegistry, generateDOCXFromRegistry, anonymizeResumeData } from '../services/documents';
import { getTemplate, isValidTemplate } from '../services/templates';
import { getTemplateById, getTemplateConfigFromDB } from '../services/template-registry';
import { scrapeJobPosting, formatJobDescription, ScrapedJobData } from '../services/jobScraper';

/** Strip characters that are invalid in HTTP Content-Disposition filenames */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^\x20-\x7E]/g, '')   // non-ASCII / control chars
    .replace(/["/\\:*?<>|]/g, '_')  // chars invalid in filenames or HTTP headers
    .trim() || 'resume';
}

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

    // No quota limits - all users have unlimited resumes

    // Upload to Cloudinary
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
      const parsedData = await extractResumeData(rawText, userId);

      const updatedResume = await prisma.resume.update({
        where: { id: resume.id },
        data: {
          rawText,
          parsedData: parsedData as any,
          parseStatus: 'completed',
        },
      });

      res.status(201).json({
        success: true,
        data: {
          id: updatedResume.id,
          title: updatedResume.title,
          fileName: updatedResume.originalFileName,
          parseStatus: updatedResume.parseStatus,
          parsedData: updatedResume.parsedData,
          rawText: updatedResume.rawText,
          createdAt: updatedResume.createdAt,
          updatedAt: updatedResume.updatedAt,
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
        photoUrl: resume.photoUrl,
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

    // Ensure parsedData is properly returned as an object
    const parsedData = resume.parsedData && typeof resume.parsedData === 'object'
      ? resume.parsedData
      : {};

    res.json({
      success: true,
      data: {
        id: resume.id,
        title: resume.title,
        fileName: resume.originalFileName,
        parseStatus: resume.parseStatus,
        parseError: resume.parseError,
        parsedData: parsedData,
        photoUrl: resume.photoUrl,
        rawText: resume.rawText,
        originalFileKey: resume.originalFileKey,
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

    // Delete Cloudinary files
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

// Download original resume file
export const downloadOriginalResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    if (!resume.originalFileKey) {
      throw new NotFoundError('Original file not found');
    }

    // Stream file directly to avoid file:// or Cloudinary auth URL issues
    const fileBuffer = await getFile(resume.originalFileKey);
    const ext = resume.originalFileKey.split('.').pop()?.toLowerCase() || 'pdf';
    const contentTypeMap: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    const fileName = resume.originalFileName || `original-resume.${ext}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName.replace(/"/g, '\\"')}"; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    res.end(fileBuffer, 'binary');
  } catch (error) {
    next(error);
  }
};

// Delete resume version
export const deleteVersion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id, versionId } = req.params;

    // Find the resume and verify ownership
    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    // Find the version
    const version = await prisma.resumeVersion.findFirst({
      where: { id: versionId, resumeId: id },
    });

    if (!version) {
      throw new NotFoundError('Version not found');
    }

    // Delete Cloudinary files
    if (version.pdfFileKey) {
      await deleteFile(version.pdfFileKey);
    }
    if (version.docxFileKey) {
      await deleteFile(version.docxFileKey);
    }

    // Delete from database
    await prisma.resumeVersion.delete({
      where: { id: versionId },
    });

    res.json({
      success: true,
      message: 'Version deleted successfully',
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
    const organizationId = null;
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

    // No version quota - unlimited versions for all users

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

    // Deduct one credit for this endpoint (regardless of how many internal AI calls)
    await deductAICredit(userId, req);

    // Create version
    const version = await prisma.resumeVersion.create({
      data: {
        resumeId: id,
        userId,
        versionNumber,
        jobTitle,
        companyName,
        jobDescription,
        jobData: result.jobData as any,
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

    // Map missing keywords to affiliate course recommendations
    const courseRecommendations = await getAffiliateCourses(result.missingKeywords);

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
        courseRecommendations,
        createdAt: version.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Transform experience objects from DB format to frontend format
const transformExperienceForFrontend = (exp: any) => {
  if (!exp) return exp;

  // Ensure description array only contains strings
  let description: string[] = [];
  if (Array.isArray(exp.description)) {
    description = exp.description.map((item: any) =>
      typeof item === 'string' ? item : String(item)
    );
  }

  // Convert database format {id, startDate, endDate, current} to frontend format {dates, description[]}
  const transformed: any = {
    title: exp.title || '',
    company: exp.company || '',
    location: exp.location || '',
    description
  };

  // Convert date fields to dates string
  if (exp.dates) {
    transformed.dates = exp.dates;
  } else if (exp.startDate && exp.endDate) {
    transformed.dates = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
  } else if (exp.startDate) {
    transformed.dates = exp.startDate;
  }

  // Remove any database-specific fields that might have been added
  delete transformed.id;
  delete transformed.startDate;
  delete transformed.endDate;
  delete transformed.current;

  return transformed;
};

// Transform resume data to ensure frontend compatibility
const transformResumeDataForFrontend = (data: any) => {
  if (!data) return data;

  const transformed = { ...data };

  // Transform experience array
  if (Array.isArray(data.experience)) {
    transformed.experience = data.experience.map(transformExperienceForFrontend);
  }

  return transformed;
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

    // Transform data to frontend format
    const originalData = transformResumeDataForFrontend(version.resume.parsedData);
    const tailoredData = transformResumeDataForFrontend(version.tailoredData);


    res.json({
      success: true,
      data: {
        id: version.id,
        versionNumber: version.versionNumber,
        jobTitle: version.jobTitle,
        companyName: version.companyName,
        jobDescription: version.jobDescription,
        originalData,
        tailoredData,
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
        resume: true,
        user: true,
      },
    });

    if (!version) {
      throw new NotFoundError('Version not found');
    }

    // Validate template exists in database
    const templateId = template as string;
    const dbTemplate = await getTemplateById(templateId);
    if (!dbTemplate) {
      throw new ValidationError(`Invalid template: ${templateId}`);
    }

    let resumeData = version.tailoredData as unknown as ParsedResumeData;

    // Add photo from resume if available
    if (version.resume.photoUrl && !resumeData.contact.photoUrl) {
      resumeData.contact.photoUrl = version.resume.photoUrl;
    }

    // Apply anonymization if requested
    if (anonymize === 'true') {
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
      buffer = await generateDOCXFromRegistry(resumeData, templateId);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileName = `resume-v${version.versionNumber}-${sanitizeFilename(version.companyName || 'tailored')}.docx`;
    } else {
      // Use React-based PDF generator for modular template system
      const { generatePDFFromReact } = await import('../services/react-pdf-generator');
      buffer = await generatePDFFromReact(templateId, resumeData);
      contentType = 'application/pdf';
      fileName = `resume-v${version.versionNumber}-${sanitizeFilename(version.companyName || 'tailored')}.pdf`;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName.replace(/"/g, '\\"')}"; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.end(buffer, 'binary');
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
    const organizationId = null;
    const { id, versionId } = req.params;
    const forceRescan = req.query.force === 'true';

    const version = await prisma.resumeVersion.findFirst({
      where: { id: versionId, resumeId: id, userId },
    });

    if (!version) {
      throw new NotFoundError('Version not found');
    }

    // Return cached result if available and force-rescan not requested.
    // This prevents score fluctuation from repeated AI calls (LLMs are
    // non-deterministic even at temperature=0 due to GPU float arithmetic).
    if (!forceRescan && version.atsDetails) {
      const cached = version.atsDetails as any;
      const courseRecommendations = await getAffiliateCourses(cached.missingKeywords || []);
      return res.json({
        success: true,
        data: { ...cached, courseRecommendations, _cached: true },
      }) as any;
    }

    // Get job keywords from stored data
    const jobData = version.jobData as any;
    const keywords = [
      ...(jobData.requiredSkills || []),
      ...(jobData.keywords || []),
    ];

    // Run fresh ATS analysis
    const atsResult = await analyzeATS(
      version.tailoredText,
      keywords,
      userId,
      organizationId
    );

    // Deduct one credit (only for actual AI calls, not cache hits)
    await deductAICredit(userId, req);

    // Persist result so future requests are served from cache
    await prisma.resumeVersion.update({
      where: { id: versionId },
      data: {
        atsScore: atsResult.score,
        atsDetails: atsResult as any,
        matchedKeywords: atsResult.matchedKeywords || [],
        missingKeywords: atsResult.missingKeywords || [],
      },
    });

    // Map missing keywords to affiliate course recommendations
    const courseRecommendations = await getAffiliateCourses(atsResult.missingKeywords);

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
        honestAssessment: atsResult.honestAssessment,
        competitorComparison: atsResult.competitorComparison,
        detailedRecommendations: atsResult.detailedRecommendations,
        quickWins: atsResult.quickWins,
        actionPlan: atsResult.actionPlan,
        courseRecommendations,
        _cached: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Scrape job posting from URL
export const scrapeJobUrl = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { url } = req.body;

    if (!url) {
      throw new ValidationError('Job posting URL is required');
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new ValidationError('Invalid URL format');
    }

    // Scrape the job posting
    const scrapedData = await scrapeJobPosting(url);

    // Format the job description
    const formattedDescription = formatJobDescription(scrapedData);

    res.json({
      success: true,
      data: {
        url: scrapedData.url,
        title: scrapedData.title,
        company: scrapedData.company,
        location: scrapedData.location,
        salary: scrapedData.salary,
        description: formattedDescription,
        requirements: scrapedData.requirements,
        benefits: scrapedData.benefits,
        employmentType: scrapedData.employmentType,
        experienceLevel: scrapedData.experienceLevel,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a blank resume (for resume builder)
export const createBlankResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title, template } = req.body;

    // No quota limits - all users have unlimited resumes

    // Default blank resume structure
    const blankResumeData: ParsedResumeData = {
      contact: {
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        website: '',
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      projects: [],
      languages: [],
      awards: [],
    };

    // Create resume record with empty rawText (will be generated when user adds content)
    const resume = await prisma.resume.create({
      data: {
        userId,
        title: title || 'Untitled Resume',
        originalFileName: 'Created with Resume Builder',
        originalFileUrl: '',
        originalFileKey: '',
        rawText: '', // Empty initially, generated on first save
        parsedData: blankResumeData as any,
        parseStatus: 'completed',
        isBase: true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: resume.id,
        title: resume.title,
        parsedData: blankResumeData,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update resume content (for resume builder)
export const updateResumeContent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { parsedData, title, photoUrl } = req.body;


    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }


    // Validate parsedData structure
    if (parsedData) {
      const validSections = [
        'contact', 'summary', 'experience', 'education',
        'skills', 'certifications', 'projects', 'languages', 'awards', 'photoUrl', 'volunteerWork'
      ];

      for (const key of Object.keys(parsedData)) {
        if (!validSections.includes(key)) {
          throw new ValidationError(`Invalid section: ${key}`);
        }
      }
    }

    // Merge with existing data
    const currentData = resume.parsedData as any;
    const updatedData = parsedData ? { ...currentData, ...parsedData } : currentData;

    // Add photoUrl to parsedData if provided
    if (photoUrl !== undefined) {
      updatedData.photoUrl = photoUrl;
      // Also add to contact info
      if (updatedData.contact) {
        updatedData.contact.photoUrl = photoUrl;
      }
    }

    // Generate raw text from parsed data for search/ATS purposes
    const rawText = generateRawTextFromParsedData(updatedData);

    const updated = await prisma.resume.update({
      where: { id },
      data: {
        parsedData: updatedData,
        rawText,
        ...(title && { title }),
        ...(photoUrl !== undefined && { photoUrl }),
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
        parsedData: updatedData,
        photoUrl: updated.photoUrl,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to generate raw text from parsed data
function generateRawTextFromParsedData(data: ParsedResumeData): string {
  const lines: string[] = [];

  // Contact
  if (data.contact) {
    if (data.contact.name) lines.push(data.contact.name);
    if (data.contact.email) lines.push(data.contact.email);
    if (data.contact.phone) lines.push(data.contact.phone);
    if (data.contact.location) lines.push(data.contact.location);
  }

  // Summary
  if (data.summary) {
    lines.push('SUMMARY', data.summary);
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    lines.push('EXPERIENCE');
    for (const exp of data.experience) {
      lines.push(`${exp.title} at ${exp.company}`);
      if (exp.location) lines.push(exp.location);
      if (exp.startDate) lines.push(`${exp.startDate} - ${exp.endDate || 'Present'}`);
      if (exp.description) {
        for (const desc of exp.description) {
          lines.push(`• ${desc}`);
        }
      }
    }
  }

  // Education
  if (data.education && data.education.length > 0) {
    lines.push('EDUCATION');
    for (const edu of data.education) {
      lines.push(edu.degree);
      lines.push(edu.institution);
      if (edu.graduationDate) lines.push(edu.graduationDate);
    }
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    lines.push('SKILLS');
    lines.push(data.skills.join(', '));
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    lines.push('CERTIFICATIONS');
    for (const cert of data.certifications) {
      lines.push(typeof cert === 'string' ? cert : cert.name);
    }
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    lines.push('PROJECTS');
    for (const proj of data.projects) {
      lines.push(proj.name);
      if (proj.description) lines.push(proj.description);
      if (proj.technologies) lines.push(proj.technologies.join(', '));
    }
  }

  // Languages
  if (data.languages && data.languages.length > 0) {
    lines.push('LANGUAGES');
    lines.push(data.languages.join(', '));
  }

  // Awards
  if (data.awards && data.awards.length > 0) {
    lines.push('AWARDS');
    for (const award of data.awards) {
      lines.push(typeof award === 'string' ? award : award.name);
    }
  }

  // Volunteer Work
  if (data.volunteerWork && data.volunteerWork.length > 0) {
    lines.push('VOLUNTEER WORK');
    for (const vol of data.volunteerWork) {
      if (typeof vol === 'string') {
        lines.push(vol);
      } else {
        lines.push(`${vol.role} at ${vol.organization}`);
        if (vol.description) {
          for (const desc of vol.description) {
            lines.push(`• ${desc}`);
          }
        }
      }
    }
  }

  return lines.join('\n');
}

// Download resume directly (for resume builder - no version needed)
export const downloadResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { format = 'pdf', template = 'london-navy' } = req.query;

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    // Validate template exists in database
    const templateId = template as string;
    const templateMetadata = await getTemplateById(templateId);

    if (!templateMetadata) {
      throw new ValidationError(`Invalid template: ${templateId}`);
    }

    const resumeData = resume.parsedData as unknown as ParsedResumeData;

    // Add photo URL if available
    if (resume.photoUrl && !resumeData.contact.photoUrl) {
      resumeData.contact.photoUrl = resume.photoUrl;
    }

    let buffer: Buffer;
    let contentType: string;
    let fileName: string;

    if (format === 'docx') {
      buffer = await generateDOCXFromRegistry(resumeData, templateId);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileName = `${sanitizeFilename(resume.title || 'resume')}.docx`;
    } else {
      // Use React-based PDF generator for modular template system
      const { generatePDFFromReact } = await import('../services/react-pdf-generator');
      buffer = await generatePDFFromReact(templateId, resumeData);
      contentType = 'application/pdf';
      fileName = `${sanitizeFilename(resume.title || 'resume')}.pdf`;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName.replace(/"/g, '\\"')}"; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.end(buffer, 'binary');
  } catch (error) {
    next(error);
  }
};

// Preview resume as HTML (for live preview)
export const previewResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { template = 'corporate-standard' } = req.query;

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    // Validate and get template from database
    const templateId = template as string;
    const templateMetadata = await getTemplateById(templateId);

    if (!templateMetadata) {
      throw new ValidationError(`Invalid template: ${templateId}`);
    }

    const resumeData = resume.parsedData as unknown as ParsedResumeData;

    // Add photo from resume if available
    if (resume.photoUrl && !resumeData.contact.photoUrl) {
      resumeData.contact.photoUrl = resume.photoUrl;
    }

    // Generate preview using React components (modular system)
    console.log(`🎯 Generating preview for template: ${templateId}`);
    const { generatePDFFromReact } = await import('../services/react-pdf-generator');
    const buffer = await generatePDFFromReact(templateId, resumeData);

    res.setHeader('Content-Type', 'application/pdf');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// Update tailored content of a resume version (no AI credits — user edit)
export const updateVersionContent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id, versionId } = req.params;
    const { tailoredData } = req.body;

    if (!tailoredData || typeof tailoredData !== 'object') {
      throw new ValidationError('tailoredData is required');
    }

    const validSections = [
      'contact', 'summary', 'experience', 'education',
      'skills', 'certifications', 'projects', 'languages', 'awards', 'volunteerWork',
    ];
    for (const key of Object.keys(tailoredData)) {
      if (!validSections.includes(key)) {
        throw new ValidationError(`Invalid section: ${key}`);
      }
    }

    // Verify the version belongs to the user
    const version = await prisma.resumeVersion.findFirst({
      where: { id: versionId, resumeId: id, userId },
    });

    if (!version) {
      throw new NotFoundError('Version not found');
    }

    // Merge incoming partial data with existing tailoredData
    const existing = (version.tailoredData as any) || {};
    const merged: ParsedResumeData = { ...existing, ...tailoredData };

    // Regenerate plain text from updated structured data
    const tailoredText = generateResumeText(merged);

    const updated = await prisma.resumeVersion.update({
      where: { id: versionId },
      data: { tailoredData: merged as any, tailoredText, updatedAt: new Date() },
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        tailoredData: merged,
        tailoredText,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Apply ATS-driven optimizations to version content (AI-powered, 1 credit)
export const optimizeVersion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id, versionId } = req.params;

    const version = await prisma.resumeVersion.findFirst({
      where: { id: versionId, resumeId: id, userId },
    });

    if (!version) {
      throw new NotFoundError('Version not found');
    }

    if (!version.atsDetails) {
      throw new ValidationError('Run an ATS scan first before optimizing');
    }

    const tailoredData = version.tailoredData as unknown as ParsedResumeData;
    const atsAnalysis = version.atsDetails as unknown as ATSAnalysis;

    // Apply improvements directly from the stored ATS analysis — no AI call needed
    const optimized: ParsedResumeData = { ...tailoredData };

    // 1. Add missing keywords to skills (dedup, case-insensitive)
    // Handle both string[] and SkillCategory[] formats
    const missingKeywords: string[] = atsAnalysis.missingKeywords || [];
    if (missingKeywords.length > 0) {
      const rawSkills = tailoredData.skills || [];
      // Flatten SkillCategory[] to string[] if needed
      const existingSkills: string[] = rawSkills.length > 0 && typeof rawSkills[0] === 'object'
        ? (rawSkills as any[]).flatMap((cat: any) => cat.items || [])
        : (rawSkills as string[]);
      const existingLower = new Set(existingSkills.map(s => s.toLowerCase()));
      const toAdd = missingKeywords.filter(k => !existingLower.has(k.toLowerCase()));
      optimized.skills = [...existingSkills, ...toAdd];
    }

    // 2. Apply the AI-suggested summary improvement if one was provided
    const suggestedSummary = atsAnalysis.detailedRecommendations?.sectionBySection?.summary?.improvements?.[0];
    if (suggestedSummary && typeof suggestedSummary === 'object' && 'after' in suggestedSummary && (suggestedSummary as { after?: string }).after) {
      optimized.summary = (suggestedSummary as { after: string }).after;
    }

    const tailoredText = generateResumeText(optimized);

    // Save updated version and clear ATS cache — content has changed
    const updated = await prisma.resumeVersion.update({
      where: { id: versionId },
      data: {
        tailoredData: optimized as any,
        tailoredText,
        atsDetails: Prisma.DbNull,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: {
        tailoredData: optimized,
        tailoredText,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
