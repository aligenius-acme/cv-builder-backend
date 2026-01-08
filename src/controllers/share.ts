import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest, ParsedResumeData } from '../types';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { generatePDF, generateDOCX } from '../services/documents';
import { getTemplate } from '../services/templates';
import crypto from 'crypto';

// Generate a unique share token
function generateShareToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Toggle sharing for a resume version
export const toggleSharing = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { resumeId, versionId } = req.params;
    const { isPublic } = req.body;

    // Verify ownership
    const version = await prisma.resumeVersion.findFirst({
      where: {
        id: versionId,
        resumeId,
        userId,
      },
    });

    if (!version) {
      throw new NotFoundError('Resume version not found');
    }

    // Generate share token if enabling sharing
    const shareToken = isPublic && !version.shareToken
      ? generateShareToken()
      : version.shareToken;

    // Update sharing settings
    const updated = await prisma.resumeVersion.update({
      where: { id: versionId },
      data: {
        isPublic: isPublic,
        shareToken: isPublic ? shareToken : version.shareToken, // Keep token even if disabled
      },
      select: {
        id: true,
        isPublic: true,
        shareToken: true,
        shareViews: true,
        shareDownloads: true,
      },
    });

    res.json({
      success: true,
      data: {
        isPublic: updated.isPublic,
        shareToken: updated.shareToken,
        shareUrl: updated.isPublic
          ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${updated.shareToken}`
          : null,
        views: updated.shareViews,
        downloads: updated.shareDownloads,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get sharing status and analytics
export const getSharingStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { resumeId, versionId } = req.params;

    const version = await prisma.resumeVersion.findFirst({
      where: {
        id: versionId,
        resumeId,
        userId,
      },
      select: {
        id: true,
        isPublic: true,
        shareToken: true,
        shareViews: true,
        shareDownloads: true,
        shareAnalytics: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            id: true,
            eventType: true,
            country: true,
            city: true,
            createdAt: true,
          },
        },
      },
    });

    if (!version) {
      throw new NotFoundError('Resume version not found');
    }

    // Get analytics summary
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentAnalytics = await prisma.shareAnalytics.groupBy({
      by: ['eventType'],
      where: {
        resumeVersionId: versionId,
        createdAt: { gte: last7Days },
      },
      _count: true,
    });

    const viewsLast7Days = recentAnalytics.find(a => a.eventType === 'view')?._count || 0;
    const downloadsLast7Days = recentAnalytics.find(a => a.eventType === 'download')?._count || 0;

    res.json({
      success: true,
      data: {
        isPublic: version.isPublic,
        shareToken: version.shareToken,
        shareUrl: version.isPublic
          ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${version.shareToken}`
          : null,
        totalViews: version.shareViews,
        totalDownloads: version.shareDownloads,
        viewsLast7Days,
        downloadsLast7Days,
        recentActivity: version.shareAnalytics,
      },
    });
  } catch (error) {
    next(error);
  }
};

// View a shared resume (public endpoint - no auth required)
export const viewSharedResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;

    const version = await prisma.resumeVersion.findUnique({
      where: { shareToken: token },
      include: {
        resume: {
          select: {
            parsedData: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!version || !version.isPublic) {
      throw new NotFoundError('Shared resume not found or link has expired');
    }

    // Track the view
    await prisma.$transaction([
      prisma.resumeVersion.update({
        where: { id: version.id },
        data: { shareViews: { increment: 1 } },
      }),
      prisma.shareAnalytics.create({
        data: {
          resumeVersionId: version.id,
          eventType: 'view',
          visitorIp: req.ip,
          userAgent: req.headers['user-agent'],
          referer: req.headers.referer,
        },
      }),
    ]);

    // Return resume data for display
    const tailoredData = version.tailoredData as unknown as ParsedResumeData;

    res.json({
      success: true,
      data: {
        jobTitle: version.jobTitle,
        companyName: version.companyName,
        atsScore: version.atsScore,
        candidateName: `${version.user.firstName || ''} ${version.user.lastName || ''}`.trim() || 'Anonymous',
        resume: {
          contact: tailoredData.contact,
          summary: tailoredData.summary,
          experience: tailoredData.experience,
          education: tailoredData.education,
          skills: tailoredData.skills,
          certifications: tailoredData.certifications,
          projects: tailoredData.projects,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Download a shared resume (public endpoint)
export const downloadSharedResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;
    const { format = 'pdf', template = 'london-navy' } = req.query;

    const version = await prisma.resumeVersion.findUnique({
      where: { shareToken: token },
    });

    if (!version || !version.isPublic) {
      throw new NotFoundError('Shared resume not found or link has expired');
    }

    // Track the download
    await prisma.$transaction([
      prisma.resumeVersion.update({
        where: { id: version.id },
        data: { shareDownloads: { increment: 1 } },
      }),
      prisma.shareAnalytics.create({
        data: {
          resumeVersionId: version.id,
          eventType: 'download',
          visitorIp: req.ip,
          userAgent: req.headers['user-agent'],
          referer: req.headers.referer,
        },
      }),
    ]);

    // Generate the document
    const tailoredData = version.tailoredData as unknown as ParsedResumeData;
    const templateConfig = getTemplate(template as string);

    let buffer: Buffer;
    let contentType: string;
    let extension: string;

    if (format === 'docx') {
      const { generateDOCX } = await import('../services/documents');
      buffer = await generateDOCX(tailoredData, templateConfig);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      extension = 'docx';
    } else {
      const { generatePDF } = await import('../services/documents');
      buffer = await generatePDF(tailoredData, templateConfig);
      contentType = 'application/pdf';
      extension = 'pdf';
    }

    const filename = `resume-${version.companyName || 'tailored'}.${extension}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
