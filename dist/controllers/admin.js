"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplates = exports.createTemplate = exports.updatePrompt = exports.getPrompts = exports.getAuditLogs = exports.getParsingErrors = exports.getAIUsage = exports.getOrganizations = exports.deleteUser = exports.updateUser = exports.getUser = exports.getUsers = exports.getDashboard = void 0;
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
// Get dashboard stats
const getDashboard = async (req, res, next) => {
    try {
        const [totalUsers, activeSubscriptions, totalResumes, totalCoverLetters, recentUsers, aiUsageStats,] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.subscription.count({
                where: {
                    planType: { not: client_1.PlanType.FREE },
                    status: client_1.SubscriptionStatus.ACTIVE,
                },
            }),
            prisma_1.prisma.resume.count(),
            prisma_1.prisma.coverLetter.count(),
            prisma_1.prisma.user.findMany({
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
            prisma_1.prisma.aIUsageLog.aggregate({
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
        await prisma_1.prisma.auditLog.create({
            data: {
                adminId: req.user.id,
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
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboard = getDashboard;
// Get all users (paginated)
const getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const role = req.query.role;
        const where = {};
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
            prisma_1.prisma.user.findMany({
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
            prisma_1.prisma.user.count({ where }),
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
                    planType: u.subscription?.planType || client_1.PlanType.FREE,
                    status: u.subscription?.status || client_1.SubscriptionStatus.ACTIVE,
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
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
// Get single user details
const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await prisma_1.prisma.user.findUnique({
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
            throw new errors_1.NotFoundError('User not found');
        }
        await prisma_1.prisma.auditLog.create({
            data: {
                adminId: req.user.id,
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
    }
    catch (error) {
        next(error);
    }
};
exports.getUser = getUser;
// Update user
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role, emailVerified } = req.body;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        const updated = await prisma_1.prisma.user.update({
            where: { id },
            data: {
                ...(role && { role }),
                ...(emailVerified !== undefined && { emailVerified }),
            },
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                adminId: req.user.id,
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
// Delete user
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (user.role === client_1.UserRole.ADMIN) {
            throw new errors_1.ValidationError('Cannot delete admin users');
        }
        await prisma_1.prisma.user.delete({
            where: { id },
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                adminId: req.user.id,
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
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
// Get all organizations
const getOrganizations = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const [orgs, total] = await Promise.all([
            prisma_1.prisma.organization.findMany({
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
            prisma_1.prisma.organization.count(),
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
    }
    catch (error) {
        next(error);
    }
};
exports.getOrganizations = getOrganizations;
// Get AI usage logs
const getAIUsage = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const userId = req.query.userId;
        const operation = req.query.operation;
        const where = {};
        if (userId) {
            where.userId = userId;
        }
        if (operation) {
            where.operation = operation;
        }
        const [logs, total, aggregates] = await Promise.all([
            prisma_1.prisma.aIUsageLog.findMany({
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
            prisma_1.prisma.aIUsageLog.count({ where }),
            prisma_1.prisma.aIUsageLog.aggregate({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAIUsage = getAIUsage;
// Get parsing errors
const getParsingErrors = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const [errors, total] = await Promise.all([
            prisma_1.prisma.parsingErrorLog.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.parsingErrorLog.count(),
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
    }
    catch (error) {
        next(error);
    }
};
exports.getParsingErrors = getParsingErrors;
// Get audit logs
const getAuditLogs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const [logs, total] = await Promise.all([
            prisma_1.prisma.auditLog.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.prisma.auditLog.count(),
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAuditLogs = getAuditLogs;
// Manage prompts
const getPrompts = async (req, res, next) => {
    try {
        const prompts = await prisma_1.prisma.promptVersion.findMany({
            orderBy: [{ name: 'asc' }, { version: 'desc' }],
        });
        res.json({
            success: true,
            data: prompts,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPrompts = getPrompts;
const updatePrompt = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { promptText, isActive } = req.body;
        const prompt = await prisma_1.prisma.promptVersion.findUnique({
            where: { id },
        });
        if (!prompt) {
            throw new errors_1.NotFoundError('Prompt not found');
        }
        // Create new version
        const latestVersion = await prisma_1.prisma.promptVersion.findFirst({
            where: { name: prompt.name },
            orderBy: { version: 'desc' },
        });
        const newPrompt = await prisma_1.prisma.promptVersion.create({
            data: {
                name: prompt.name,
                version: (latestVersion?.version || 0) + 1,
                promptText: promptText || prompt.promptText,
                isActive: isActive ?? true,
            },
        });
        // Deactivate old versions if this is active
        if (newPrompt.isActive) {
            await prisma_1.prisma.promptVersion.updateMany({
                where: {
                    name: prompt.name,
                    id: { not: newPrompt.id },
                },
                data: { isActive: false },
            });
        }
        await prisma_1.prisma.auditLog.create({
            data: {
                adminId: req.user.id,
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
    }
    catch (error) {
        next(error);
    }
};
exports.updatePrompt = updatePrompt;
// Create template
const createTemplate = async (req, res, next) => {
    try {
        const { name, description, templateConfig, isDefault, isPremium, isAtsSafe } = req.body;
        if (!name || !templateConfig) {
            throw new errors_1.ValidationError('Name and template config are required');
        }
        const template = await prisma_1.prisma.resumeTemplate.create({
            data: {
                name,
                description,
                templateConfig,
                isDefault: isDefault || false,
                isPremium: isPremium || false,
                isAtsSafe: isAtsSafe !== false,
            },
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'CREATE_TEMPLATE',
                targetType: 'template',
                targetId: template.id,
            },
        });
        res.status(201).json({
            success: true,
            data: template,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createTemplate = createTemplate;
// Get templates
const getTemplates = async (req, res, next) => {
    try {
        const templates = await prisma_1.prisma.resumeTemplate.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            success: true,
            data: templates,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTemplates = getTemplates;
//# sourceMappingURL=admin.js.map