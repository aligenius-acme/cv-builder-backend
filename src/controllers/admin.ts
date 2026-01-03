import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';
import { ValidationError, NotFoundError } from '../utils/errors';
import { UserRole, PlanType, SubscriptionStatus } from '@prisma/client';

// Get dashboard stats
export const getDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalUsers,
      activeSubscriptions,
      totalResumes,
      totalCoverLetters,
      recentUsers,
      aiUsageStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({
        where: {
          planType: { not: PlanType.FREE },
          status: SubscriptionStatus.ACTIVE,
        },
      }),
      prisma.resume.count(),
      prisma.coverLetter.count(),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      }),
      prisma.aIUsageLog.aggregate({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        _sum: {
          totalTokens: true,
          estimatedCost: true,
        },
        _count: true,
      }),
    ]);

    // Log admin action
    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'VIEW_DASHBOARD',
        targetType: 'system',
      },
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeSubscriptions,
          totalResumes,
          totalCoverLetters,
          aiRequests30d: aiUsageStats._count,
          aiCost30d: Number(aiUsageStats._sum.estimatedCost || 0).toFixed(2),
        },
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (paginated)
export const getUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as UserRole;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: {
            select: {
              planType: true,
              status: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              resumes: true,
              coverLetters: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users: users.map((u) => ({
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          planType: u.subscription?.planType || PlanType.FREE,
          status: u.subscription?.status || SubscriptionStatus.ACTIVE,
          organization: u.organization,
          resumeCount: u._count.resumes,
          coverLetterCount: u._count.coverLetters,
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single user details
export const getUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        organization: {
          include: {
            subscription: true,
          },
        },
        resumes: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        aiUsageLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'VIEW_USER',
        targetType: 'user',
        targetId: id,
      },
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        subscription: user.subscription,
        organization: user.organization,
        resumes: user.resumes,
        recentAIUsage: user.aiUsageLogs,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, emailVerified } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(emailVerified !== undefined && { emailVerified }),
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'UPDATE_USER',
        targetType: 'user',
        targetId: id,
        details: { role, emailVerified },
      },
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        emailVerified: updated.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role === UserRole.ADMIN) {
      throw new ValidationError('Cannot delete admin users');
    }

    await prisma.user.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'DELETE_USER',
        targetType: 'user',
        targetId: id,
        details: { email: user.email },
      },
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get all organizations
export const getOrganizations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [orgs, total] = await Promise.all([
      prisma.organization.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: true,
          _count: {
            select: { users: true },
          },
        },
      }),
      prisma.organization.count(),
    ]);

    res.json({
      success: true,
      data: {
        organizations: orgs.map((o) => ({
          id: o.id,
          name: o.name,
          domain: o.domain,
          userCount: o._count.users,
          subscription: o.subscription,
          createdAt: o.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get AI usage logs
export const getAIUsage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const userId = req.query.userId as string;
    const operation = req.query.operation as string;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (operation) {
      where.operation = operation;
    }

    const [logs, total, aggregates] = await Promise.all([
      prisma.aIUsageLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      prisma.aIUsageLog.count({ where }),
      prisma.aIUsageLog.aggregate({
        where,
        _sum: {
          totalTokens: true,
          estimatedCost: true,
        },
        _avg: {
          durationMs: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        aggregates: {
          totalTokens: aggregates._sum.totalTokens || 0,
          totalCost: Number(aggregates._sum.estimatedCost || 0).toFixed(2),
          avgDuration: Math.round(aggregates._avg.durationMs || 0),
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get parsing errors
export const getParsingErrors = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const [errors, total] = await Promise.all([
      prisma.parsingErrorLog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.parsingErrorLog.count(),
    ]);

    res.json({
      success: true,
      data: {
        errors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get audit logs
export const getAuditLogs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count(),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Manage prompts
export const getPrompts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prompts = await prisma.promptVersion.findMany({
      orderBy: [{ name: 'asc' }, { version: 'desc' }],
    });

    res.json({
      success: true,
      data: prompts,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePrompt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { promptText, isActive } = req.body;

    const prompt = await prisma.promptVersion.findUnique({
      where: { id },
    });

    if (!prompt) {
      throw new NotFoundError('Prompt not found');
    }

    // Create new version
    const latestVersion = await prisma.promptVersion.findFirst({
      where: { name: prompt.name },
      orderBy: { version: 'desc' },
    });

    const newPrompt = await prisma.promptVersion.create({
      data: {
        name: prompt.name,
        version: (latestVersion?.version || 0) + 1,
        promptText: promptText || prompt.promptText,
        isActive: isActive ?? true,
      },
    });

    // Deactivate old versions if this is active
    if (newPrompt.isActive) {
      await prisma.promptVersion.updateMany({
        where: {
          name: prompt.name,
          id: { not: newPrompt.id },
        },
        data: { isActive: false },
      });
    }

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'UPDATE_PROMPT',
        targetType: 'prompt',
        targetId: newPrompt.id,
        details: { name: prompt.name, version: newPrompt.version },
      },
    });

    res.json({
      success: true,
      data: newPrompt,
    });
  } catch (error) {
    next(error);
  }
};

// Create template
export const createTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, templateConfig, isDefault, isPremium, isAtsSafe } = req.body;

    if (!name || !templateConfig) {
      throw new ValidationError('Name and template config are required');
    }

    const template = await prisma.resumeTemplate.create({
      data: {
        name,
        description,
        templateConfig,
        isDefault: isDefault || false,
        isPremium: isPremium || false,
        isAtsSafe: isAtsSafe !== false,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'CREATE_TEMPLATE',
        targetType: 'template',
        targetId: template.id,
      },
    });

    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

// Get templates
export const getTemplates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const templates = await prisma.resumeTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};
