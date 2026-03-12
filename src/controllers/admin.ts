import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';
import { ValidationError, NotFoundError } from '../utils/errors';
import { UserRole } from '@prisma/client';
import { invalidateAffiliateCache, seedAffiliateLinksIfEmpty } from '../config/affiliateLinks';
import { getAllSettings, setSetting, SETTING_DEFAULTS, seedSettingsIfEmpty, invalidateSettingsCache } from '../config/appSettings';

const MODULE_OPERATIONS: { module: string; operations: string[] }[] = [
  { module: 'Resume Tailoring',   operations: ['resume_customize', 'job_analysis', 'truth_guard'] },
  { module: 'ATS Analysis',       operations: ['ats_analysis'] },
  { module: 'Cover Letters',      operations: ['cover_letter', 'cover_letter_enhanced'] },
  { module: 'Job Match Score',    operations: ['job_match_score'] },
  { module: 'AI Writing',         operations: ['writing_suggestions', 'writing_completions', 'generate_bullets'] },
  { module: 'Career Performance', operations: ['resume_performance_score', 'quantify_achievements', 'weakness_detector'] },
  { module: 'Skill Gap',          operations: ['skill_gap_analysis'] },
  { module: 'Salary Analyzer',    operations: ['salary_analysis', 'offer_comparison', 'negotiation_script'] },
  { module: 'Interview Prep',     operations: ['interview_questions', 'answer_evaluation'] },
  { module: 'Networking',         operations: ['follow_up_email', 'networking_message'] },
  { module: 'Job Board',          operations: ['job_details_generation'] },
];

// Get dashboard stats
export const getDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Execute all queries in parallel for performance
    const [
      // Basic counts
      totalUsers,
      totalResumes,
      totalCoverLetters,
      totalResumeVersions,
      totalJobApplications,
      totalSavedJobs,

      // User metrics
      activeUsers,
      newUsers,
      oldNewUsers,

      // Pro users
      proUsers,

      // AI metrics
      aiUsageStats,
      aiCreditsData,
      topAIUsersData,
      aiOpBreakdown,
      aiSuccessData,

      // System health
      parsingErrors,
      recentErrors,

      // Recent data
      recentUsers,

      // Module usage
      aiLogsCurrent,
      aiLogsPrev,
      resumeCount30d,
      resumeCountPrev,
      jobAppCount30d,
      jobAppCountPrev,
      abTestCount30d,
      abTestCountPrev,
      shareCount30d,
      shareCountPrev,
    ] = await Promise.all([
      // Basic counts
      prisma.user.count(),
      prisma.resume.count(),
      prisma.coverLetter.count(),
      prisma.resumeVersion.count(),
      prisma.jobApplication.count(),
      prisma.savedJob.count(),

      // User metrics (30 days)
      prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),

      // Pro users
      prisma.user.count({ where: { plan: 'PRO' } }),

      // AI usage stats (30 days)
      prisma.aIUsageLog.aggregate({
        where: { createdAt: { gte: thirtyDaysAgo } },
        _sum: { totalTokens: true, estimatedCost: true },
        _count: true,
      }),

      // AI credits
      prisma.user.aggregate({
        _sum: { aiCredits: true, aiCreditsUsed: true },
      }),

      // Top 5 AI users
      prisma.aIUsageLog.groupBy({
        by: ['userId'],
        _sum: { totalTokens: true, estimatedCost: true },
        _count: true,
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { _sum: { totalTokens: 'desc' } },
        take: 5,
      }),

      // AI operations breakdown
      prisma.aIUsageLog.groupBy({
        by: ['operation'],
        _count: true,
        _sum: { estimatedCost: true },
        _avg: { durationMs: true },
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { _count: { operation: 'desc' } },
      }),

      // AI success rate
      prisma.aIUsageLog.aggregate({
        where: { success: true, createdAt: { gte: thirtyDaysAgo } },
        _count: true,
      }),

      // System health
      prisma.parsingErrorLog.count(),
      prisma.parsingErrorLog.count({ where: { createdAt: { gte: yesterday } } }),

      // Recent users
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

      // Module usage — AI logs current 30d
      prisma.aIUsageLog.findMany({
        where: { createdAt: { gte: thirtyDaysAgo }, success: true },
        select: { operation: true, userId: true, estimatedCost: true },
      }),

      // Module usage — AI logs previous 30d (for trend)
      prisma.aIUsageLog.groupBy({
        by: ['operation'],
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, success: true },
        _count: { id: true },
      }),

      // Non-AI module counts: current + previous 30d
      prisma.resume.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.resume.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.jobApplication.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.jobApplication.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.resumeABTest.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.resumeABTest.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.shareAnalytics.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.shareAnalytics.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    ]);

    // Fetch user details for top AI users
    const topAIUserIds = topAIUsersData.map((u) => u.userId);
    const topAIUsersDetails = await prisma.user.findMany({
      where: { id: { in: topAIUserIds } },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    const topAIUsersMap = new Map(topAIUsersDetails.map((u) => [u.id, u]));
    const topAIUsers = topAIUsersData.map((u) => {
      const user = topAIUsersMap.get(u.userId);
      return {
        userId: u.userId,
        email: user?.email || 'Unknown',
        firstName: user?.firstName || null,
        lastName: user?.lastName || null,
        totalTokens: u._sum.totalTokens || 0,
        totalCost: Number(u._sum.estimatedCost || 0).toFixed(4),
        requestCount: u._count,
      };
    });

    // Calculate derived metrics
    const userGrowthRate = oldNewUsers > 0
      ? ((newUsers - oldNewUsers) / oldNewUsers * 100).toFixed(1)
      : '0';

    const avgVersionsPerResume = totalResumes > 0
      ? (totalResumeVersions / totalResumes).toFixed(1)
      : '0';

    const aiSuccessRate = aiUsageStats._count > 0
      ? ((aiSuccessData._count / aiUsageStats._count) * 100).toFixed(1)
      : '0';

    const parsingSuccessRate = totalResumes > 0
      ? (((totalResumes - parsingErrors) / totalResumes) * 100).toFixed(1)
      : '100';

    const errorRate24h = totalResumes > 0
      ? ((recentErrors / totalResumes) * 100).toFixed(2)
      : '0';

    // Module usage aggregation
    const prevMap = new Map(aiLogsPrev.map((r) => [r.operation, r._count.id]));

    const aiModules = MODULE_OPERATIONS.map(({ module, operations }) => {
      const rows = aiLogsCurrent.filter((r) => operations.includes(r.operation));
      const actions30d = rows.length;
      const cost30d = rows.reduce((s, r) => s + Number(r.estimatedCost || 0), 0);
      const uniqueUsers30d = new Set(rows.map((r) => r.userId)).size;
      const prev = operations.reduce((s, op) => s + (prevMap.get(op) || 0), 0);
      const trend = prev > 0 ? ((actions30d - prev) / prev) * 100 : (actions30d > 0 ? 100 : 0);
      return {
        module,
        type: 'ai' as const,
        actions30d,
        uniqueUsers30d,
        cost30d: parseFloat(cost30d.toFixed(4)),
        trend: parseFloat(trend.toFixed(1)),
      };
    });

    const calcTrend = (curr: number, prev: number) =>
      prev > 0 ? parseFloat((((curr - prev) / prev) * 100).toFixed(1)) : (curr > 0 ? 100 : 0);

    const nonAiModules = [
      { module: 'Resume Builder', type: 'non-ai' as const, actions30d: resumeCount30d,  uniqueUsers30d: 0, cost30d: 0, trend: calcTrend(resumeCount30d, resumeCountPrev) },
      { module: 'Job Tracker',    type: 'non-ai' as const, actions30d: jobAppCount30d,   uniqueUsers30d: 0, cost30d: 0, trend: calcTrend(jobAppCount30d, jobAppCountPrev) },
      { module: 'A/B Testing',    type: 'non-ai' as const, actions30d: abTestCount30d,   uniqueUsers30d: 0, cost30d: 0, trend: calcTrend(abTestCount30d, abTestCountPrev) },
      { module: 'Resume Sharing', type: 'non-ai' as const, actions30d: shareCount30d,    uniqueUsers30d: 0, cost30d: 0, trend: calcTrend(shareCount30d, shareCountPrev) },
    ];

    const moduleUsage = [...aiModules, ...nonAiModules].sort((a, b) => b.actions30d - a.actions30d);

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
          // Existing stats
          totalUsers,
          totalResumes,
          totalCoverLetters,
          aiRequests30d: aiUsageStats._count,
          aiCost30d: Number(aiUsageStats._sum.estimatedCost || 0).toFixed(2),

          // Enhanced stats
          totalResumeVersions,
          totalJobApplications,
          totalSavedJobs,
          activeUsers30d: activeUsers,
          newUsers30d: newUsers,
          proUsers,
          userGrowthRate: parseFloat(userGrowthRate),
          avgVersionsPerResume: parseFloat(avgVersionsPerResume),

          // AI metrics
          aiCreditsRemaining: aiCreditsData._sum.aiCredits || 0,
          aiCreditsUsed: aiCreditsData._sum.aiCreditsUsed || 0,
          aiSuccessRate: parseFloat(aiSuccessRate),

          // System health
          parsingSuccessRate: parseFloat(parsingSuccessRate),
          errorRate24h: parseFloat(errorRate24h),
          totalParsingErrors: parsingErrors,
          recentErrors24h: recentErrors,
        },
        topAIUsers,
        aiOperations: aiOpBreakdown.map((op) => ({
          operation: op.operation,
          count: op._count,
          totalCost: Number(op._sum.estimatedCost || 0).toFixed(4),
          avgDuration: Math.round(op._avg.durationMs || 0),
        })),
        recentUsers,
        moduleUsage,
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
    const plan = req.query.plan as string;

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

    if (plan && ['FREE', 'PRO'].includes(plan)) {
      where.plan = plan;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
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
          plan: u.plan,
          stripeSubscriptionId: u.stripeSubscriptionId,
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
    const { role, emailVerified, plan } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updateData: any = {
      ...(role && { role }),
      ...(emailVerified !== undefined && { emailVerified }),
    };

    if (plan && ['FREE', 'PRO'].includes(plan)) {
      updateData.plan = plan;
      // When manually granting Free, also clear subscription IDs
      if (plan === 'FREE') {
        updateData.stripeSubscriptionId = null;
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'UPDATE_USER',
        targetType: 'user',
        targetId: id,
        details: { role, emailVerified, plan },
      },
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        plan: updated.plan,
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

    // Fetch admin user details for each log
    const adminIds = [...new Set(logs.map((log) => log.adminId))];
    const adminUsers = await prisma.user.findMany({
      where: { id: { in: adminIds } },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    });

    // Create a map for quick lookup
    const adminMap = new Map(adminUsers.map((u) => [u.id, u]));

    // Attach admin data to each log
    const enrichedLogs = logs.map((log) => ({
      ...log,
      admin: adminMap.get(log.adminId) || null,
    }));

    res.json({
      success: true,
      data: {
        logs: enrichedLogs,
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

export const createPrompt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, promptText } = req.body;

    if (!name || !promptText) {
      res.status(400).json({ success: false, error: 'name and promptText are required' });
      return;
    }

    // Reject if any version already exists for this name
    const existing = await prisma.promptVersion.findFirst({ where: { name } });
    if (existing) {
      res.status(409).json({ success: false, error: `Prompt "${name}" already exists. Use Edit to update it.` });
      return;
    }

    const prompt = await prisma.promptVersion.create({
      data: { name, version: 1, promptText, isActive: true },
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'CREATE_PROMPT',
        targetType: 'prompt',
        targetId: prompt.id,
        details: { name, version: 1 },
      },
    });

    res.status(201).json({ success: true, data: prompt });
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

// ─── Affiliate Link Management ───────────────────────────────────────────────

// GET /admin/affiliates — list all affiliate links (seed on first call if empty)
export const getAffiliates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await seedAffiliateLinksIfEmpty();
    const links = await prisma.affiliateLink.findMany({
      orderBy: [{ provider: 'asc' }, { skill: 'asc' }],
    });
    res.json({ success: true, data: links });
  } catch (error) {
    next(error);
  }
};

// POST /admin/affiliates — create a new affiliate link
export const createAffiliate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { skill, title, url, provider, isActive, showOnCreditsPage } = req.body;
    if (!skill || !title || !url || !provider) {
      throw new ValidationError('skill, title, url, and provider are required');
    }
    const link = await prisma.affiliateLink.create({
      data: {
        skill: skill.toLowerCase().trim(),
        title: title.trim(),
        url: url.trim(),
        provider: provider.trim(),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        showOnCreditsPage: showOnCreditsPage !== undefined ? Boolean(showOnCreditsPage) : false,
      },
    });
    invalidateAffiliateCache();
    res.status(201).json({ success: true, data: link });
  } catch (error) {
    next(error);
  }
};

// PUT /admin/affiliates/:id — update an affiliate link
export const updateAffiliate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { skill, title, url, provider, isActive, showOnCreditsPage } = req.body;

    const existing = await prisma.affiliateLink.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Affiliate link not found');

    const link = await prisma.affiliateLink.update({
      where: { id },
      data: {
        ...(skill !== undefined && { skill: skill.toLowerCase().trim() }),
        ...(title !== undefined && { title: title.trim() }),
        ...(url !== undefined && { url: url.trim() }),
        ...(provider !== undefined && { provider: provider.trim() }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(showOnCreditsPage !== undefined && { showOnCreditsPage: Boolean(showOnCreditsPage) }),
      },
    });
    invalidateAffiliateCache();
    res.json({ success: true, data: link });
  } catch (error) {
    next(error);
  }
};

// DELETE /admin/affiliates/:id — delete an affiliate link
export const deleteAffiliate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.affiliateLink.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Affiliate link not found');

    await prisma.affiliateLink.delete({ where: { id } });
    invalidateAffiliateCache();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ─── App Settings ─────────────────────────────────────────────────────────────

/** GET /admin/settings — return all settings as { key: value } map */
export const getSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await seedSettingsIfEmpty();
    const settings = await getAllSettings();
    res.json({ success: true, data: { settings, defaults: SETTING_DEFAULTS } });
  } catch (error) {
    next(error);
  }
};

/** PUT /admin/settings/:key — update a single setting */
export const updateSetting = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!(key in SETTING_DEFAULTS)) {
      throw new ValidationError(`Unknown setting: ${key}`);
    }

    if (value === undefined || value === null) {
      throw new ValidationError('value is required');
    }

    // Validate numeric settings
    if (key === 'freeMonthlyCredits') {
      const n = parseInt(String(value), 10);
      if (isNaN(n) || n < 1 || n > 100) {
        throw new ValidationError('freeMonthlyCredits must be between 1 and 100');
      }
    }

    await setSetting(key, String(value));
    invalidateSettingsCache();

    res.json({ success: true, data: { key, value: String(value) } });
  } catch (error) {
    next(error);
  }
};
