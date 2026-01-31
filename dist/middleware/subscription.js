"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackAIUsage = exports.checkAnonymizationAccess = exports.checkATSSimulatorAccess = exports.checkCoverLetterAccess = exports.checkResumeQuota = exports.requireProPlan = exports.requireActiveSubscription = exports.getSubscriptionLimits = void 0;
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
// Define limits for each plan
const PLAN_LIMITS = {
    [client_1.PlanType.FREE]: {
        maxResumes: 1,
        maxVersionsPerResume: 3,
        coverLettersEnabled: false,
        atsSimulatorEnabled: false,
        customTemplatesEnabled: false,
        anonymizationEnabled: false,
    },
    [client_1.PlanType.PRO]: {
        maxResumes: 10,
        maxVersionsPerResume: -1, // Unlimited
        coverLettersEnabled: true,
        atsSimulatorEnabled: true,
        customTemplatesEnabled: true,
        anonymizationEnabled: false,
    },
    [client_1.PlanType.BUSINESS]: {
        maxResumes: -1, // Unlimited (per org quota)
        maxVersionsPerResume: -1,
        coverLettersEnabled: true,
        atsSimulatorEnabled: true,
        customTemplatesEnabled: true,
        anonymizationEnabled: true,
    },
};
// Get subscription limits for user
const getSubscriptionLimits = (planType) => {
    return PLAN_LIMITS[planType];
};
exports.getSubscriptionLimits = getSubscriptionLimits;
// Check if subscription is active
const requireActiveSubscription = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new errors_1.SubscriptionError('Authentication required'));
        }
        const subscription = await prisma_1.prisma.subscription.findUnique({
            where: { userId: req.user.id },
        });
        if (!subscription || subscription.status !== client_1.SubscriptionStatus.ACTIVE) {
            return next(new errors_1.SubscriptionError('Active subscription required'));
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireActiveSubscription = requireActiveSubscription;
// Require Pro or Business plan
const requireProPlan = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new errors_1.SubscriptionError('Authentication required'));
        }
        if (req.user.planType === client_1.PlanType.FREE) {
            return next(new errors_1.SubscriptionError('This feature requires a Pro or Business plan. Upgrade to access premium features.'));
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireProPlan = requireProPlan;
// Check resume quota
const checkResumeQuota = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new errors_1.SubscriptionError('Authentication required'));
        }
        const limits = (0, exports.getSubscriptionLimits)(req.user.planType);
        // Unlimited resumes
        if (limits.maxResumes === -1) {
            return next();
        }
        // Check for B2B org limits
        if (req.user.organizationId) {
            const org = await prisma_1.prisma.organization.findUnique({
                where: { id: req.user.organizationId },
                include: {
                    _count: {
                        select: {
                            users: {
                                where: {
                                    resumes: {
                                        some: {},
                                    },
                                },
                            },
                        },
                    },
                },
            });
            // For B2B, check org monthly limits separately
            return next();
        }
        // Check user's resume count
        const resumeCount = await prisma_1.prisma.resume.count({
            where: { userId: req.user.id },
        });
        if (resumeCount >= limits.maxResumes) {
            // Generate plan-specific upgrade message
            const currentPlan = req.user.planType;
            const upgradeMessage = currentPlan === client_1.PlanType.FREE
                ? 'Upgrade to Pro for up to 10 resumes or Business for unlimited resumes.'
                : 'Upgrade to Business for unlimited resumes.';
            return next(new errors_1.QuotaExceededError(`You've reached your plan's resume limit (${resumeCount}/${limits.maxResumes}). ${upgradeMessage}`));
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkResumeQuota = checkResumeQuota;
// Check cover letter access
const checkCoverLetterAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new errors_1.SubscriptionError('Authentication required'));
        }
        const limits = (0, exports.getSubscriptionLimits)(req.user.planType);
        if (!limits.coverLettersEnabled) {
            const currentPlan = req.user.planType;
            const availablePlans = currentPlan === client_1.PlanType.FREE
                ? 'Pro or Business plan'
                : 'Business plan';
            return next(new errors_1.SubscriptionError(`Cover letter generation is not available on your current plan. Upgrade to ${availablePlans} to unlock this feature.`));
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkCoverLetterAccess = checkCoverLetterAccess;
// Check ATS simulator access
const checkATSSimulatorAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new errors_1.SubscriptionError('Authentication required'));
        }
        const limits = (0, exports.getSubscriptionLimits)(req.user.planType);
        if (!limits.atsSimulatorEnabled) {
            const currentPlan = req.user.planType;
            const availablePlans = currentPlan === client_1.PlanType.FREE
                ? 'Pro or Business plan'
                : 'Business plan';
            return next(new errors_1.SubscriptionError(`ATS Simulator is not available on your current plan. Upgrade to ${availablePlans} to unlock this feature.`));
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkATSSimulatorAccess = checkATSSimulatorAccess;
// Check anonymization access (B2B only)
const checkAnonymizationAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new errors_1.SubscriptionError('Authentication required'));
        }
        const limits = (0, exports.getSubscriptionLimits)(req.user.planType);
        if (!limits.anonymizationEnabled) {
            return next(new errors_1.SubscriptionError(`Anonymization feature is only available on the Business plan. Upgrade to Business to mask candidate information for recruiting purposes.`));
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkAnonymizationAccess = checkAnonymizationAccess;
// Track AI usage for cost management
const trackAIUsage = async (userId, organizationId, operation, provider, model, promptTokens, completionTokens, durationMs, success = true, errorMessage) => {
    // Estimate cost based on provider and model
    const costPerInputToken = provider === 'anthropic' ? 0.000003 : 0.00001;
    const costPerOutputToken = provider === 'anthropic' ? 0.000015 : 0.00003;
    const estimatedCost = (promptTokens * costPerInputToken) + (completionTokens * costPerOutputToken);
    await prisma_1.prisma.aIUsageLog.create({
        data: {
            userId,
            organizationId,
            operation,
            provider,
            model,
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
            estimatedCost,
            durationMs,
            success,
            errorMessage,
        },
    });
};
exports.trackAIUsage = trackAIUsage;
//# sourceMappingURL=subscription.js.map