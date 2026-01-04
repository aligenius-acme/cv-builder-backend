import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { ApplicationStatus } from '@prisma/client';

// Get all job applications for user
export const getApplications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { status, search } = req.query;

    const where: any = { userId };

    if (status && status !== 'all') {
      where.status = status as ApplicationStatus;
    }

    if (search) {
      where.OR = [
        { jobTitle: { contains: search as string, mode: 'insensitive' } },
        { companyName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const applications = await prisma.jobApplication.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { statusOrder: 'asc' },
        { updatedAt: 'desc' },
      ],
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    // Group by status for Kanban view
    const grouped = {
      WISHLIST: applications.filter(a => a.status === 'WISHLIST'),
      APPLIED: applications.filter(a => a.status === 'APPLIED'),
      SCREENING: applications.filter(a => a.status === 'SCREENING'),
      INTERVIEWING: applications.filter(a => a.status === 'INTERVIEWING'),
      OFFER: applications.filter(a => a.status === 'OFFER'),
      REJECTED: applications.filter(a => a.status === 'REJECTED'),
      ACCEPTED: applications.filter(a => a.status === 'ACCEPTED'),
      WITHDRAWN: applications.filter(a => a.status === 'WITHDRAWN'),
    };

    // Stats
    const stats = {
      total: applications.length,
      wishlist: grouped.WISHLIST.length,
      applied: grouped.APPLIED.length,
      interviewing: grouped.SCREENING.length + grouped.INTERVIEWING.length,
      offers: grouped.OFFER.length,
      rejected: grouped.REJECTED.length,
      accepted: grouped.ACCEPTED.length,
    };

    res.json({
      success: true,
      data: {
        applications,
        grouped,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single application
export const getApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const application = await prisma.jobApplication.findFirst({
      where: { id, userId },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!application) {
      res.status(404).json({ success: false, error: 'Application not found' });
      return;
    }

    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// Create new application
export const createApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      jobTitle,
      companyName,
      location,
      salary,
      jobUrl,
      jobDescription,
      status = 'WISHLIST',
      deadline,
      source,
      priority,
      notes,
      contactName,
      contactEmail,
    } = req.body;

    if (!jobTitle || !companyName) {
      res.status(400).json({ success: false, error: 'Job title and company name are required' });
      return;
    }

    // Get max order for status column
    const maxOrder = await prisma.jobApplication.aggregate({
      where: { userId, status: status as ApplicationStatus },
      _max: { statusOrder: true },
    });

    const application = await prisma.jobApplication.create({
      data: {
        userId,
        jobTitle,
        companyName,
        location,
        salary,
        jobUrl,
        jobDescription,
        status: status as ApplicationStatus,
        statusOrder: (maxOrder._max.statusOrder ?? -1) + 1,
        deadline: deadline ? new Date(deadline) : null,
        source,
        priority: priority ?? 0,
        notes,
        contactName,
        contactEmail,
        appliedAt: status === 'APPLIED' ? new Date() : null,
        activities: {
          create: {
            type: 'created',
            description: `Added ${jobTitle} at ${companyName} to tracker`,
          },
        },
      },
      include: {
        activities: true,
      },
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// Update application
export const updateApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const updates = req.body;

    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Application not found' });
      return;
    }

    // Track status change for activity log
    const activities: any[] = [];
    if (updates.status && updates.status !== existing.status) {
      activities.push({
        type: 'status_change',
        description: `Status changed from ${existing.status} to ${updates.status}`,
        oldValue: existing.status,
        newValue: updates.status,
      });

      // Set appliedAt if moving to APPLIED
      if (updates.status === 'APPLIED' && !existing.appliedAt) {
        updates.appliedAt = new Date();
      }
    }

    if (updates.interviewDate && updates.interviewDate !== existing.interviewDate?.toISOString()) {
      activities.push({
        type: 'interview_scheduled',
        description: `Interview scheduled for ${new Date(updates.interviewDate).toLocaleDateString()}`,
        newValue: updates.interviewDate,
      });
    }

    if (updates.offerAmount && updates.offerAmount !== existing.offerAmount) {
      activities.push({
        type: 'offer_received',
        description: `Offer received: ${updates.offerAmount}`,
        newValue: updates.offerAmount,
      });
    }

    // Parse dates
    const dateFields = ['deadline', 'interviewDate', 'nextFollowUp', 'offerDeadline', 'appliedAt'];
    for (const field of dateFields) {
      if (updates[field]) {
        updates[field] = new Date(updates[field]);
      }
    }

    const application = await prisma.jobApplication.update({
      where: { id },
      data: {
        ...updates,
        activities: activities.length > 0 ? {
          create: activities,
        } : undefined,
      },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// Update application status (for drag-and-drop)
export const updateStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status, statusOrder } = req.body;

    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Application not found' });
      return;
    }

    const updates: any = {
      status: status as ApplicationStatus,
      statusOrder: statusOrder ?? 0,
    };

    // Auto-set appliedAt when moving to APPLIED
    if (status === 'APPLIED' && !existing.appliedAt) {
      updates.appliedAt = new Date();
    }

    const activities: any[] = [];
    if (status !== existing.status) {
      activities.push({
        type: 'status_change',
        description: `Status changed from ${existing.status} to ${status}`,
        oldValue: existing.status,
        newValue: status,
      });
    }

    const application = await prisma.jobApplication.update({
      where: { id },
      data: {
        ...updates,
        activities: activities.length > 0 ? {
          create: activities,
        } : undefined,
      },
    });

    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// Reorder applications within a column
export const reorderApplications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { applications } = req.body; // Array of { id, statusOrder }

    if (!Array.isArray(applications)) {
      res.status(400).json({ success: false, error: 'Applications array is required' });
      return;
    }

    // Update all in a transaction
    await prisma.$transaction(
      applications.map((app: { id: string; statusOrder: number; status?: string }) =>
        prisma.jobApplication.updateMany({
          where: { id: app.id, userId },
          data: {
            statusOrder: app.statusOrder,
            status: app.status as ApplicationStatus | undefined,
          },
        })
      )
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Delete application
export const deleteApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Application not found' });
      return;
    }

    await prisma.jobApplication.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    next(error);
  }
};

// Add activity/note to application
export const addActivity = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { type, description } = req.body;

    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ success: false, error: 'Application not found' });
      return;
    }

    const activity = await prisma.jobActivity.create({
      data: {
        jobApplicationId: id,
        type: type || 'note',
        description,
      },
    });

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

// Get application statistics
export const getStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const [
      totalApplications,
      statusCounts,
      recentActivity,
      upcomingInterviews,
      upcomingDeadlines,
    ] = await Promise.all([
      prisma.jobApplication.count({ where: { userId } }),
      prisma.jobApplication.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      prisma.jobActivity.findMany({
        where: { jobApplication: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          jobApplication: {
            select: { jobTitle: true, companyName: true },
          },
        },
      }),
      prisma.jobApplication.findMany({
        where: {
          userId,
          interviewDate: { gte: new Date() },
          status: { in: ['SCREENING', 'INTERVIEWING'] },
        },
        orderBy: { interviewDate: 'asc' },
        take: 5,
      }),
      prisma.jobApplication.findMany({
        where: {
          userId,
          deadline: { gte: new Date() },
          status: { in: ['WISHLIST', 'APPLIED'] },
        },
        orderBy: { deadline: 'asc' },
        take: 5,
      }),
    ]);

    // Calculate response rate
    const applied = statusCounts.find(s => s.status === 'APPLIED')?._count ?? 0;
    const gotResponse = statusCounts
      .filter(s => ['SCREENING', 'INTERVIEWING', 'OFFER', 'ACCEPTED', 'REJECTED'].includes(s.status))
      .reduce((sum, s) => sum + s._count, 0);
    const responseRate = applied > 0 ? Math.round((gotResponse / (applied + gotResponse)) * 100) : 0;

    // Convert to object
    const statusCountsObj: Record<string, number> = {};
    statusCounts.forEach(s => {
      statusCountsObj[s.status] = s._count;
    });

    res.json({
      success: true,
      data: {
        totalApplications,
        statusCounts: statusCountsObj,
        responseRate,
        recentActivity,
        upcomingInterviews,
        upcomingDeadlines,
      },
    });
  } catch (error) {
    next(error);
  }
};
