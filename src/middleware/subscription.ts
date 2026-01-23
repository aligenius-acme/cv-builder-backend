import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, SubscriptionLimits } from '../types';
import { prisma } from '../utils/prisma';
import { SubscriptionError, QuotaExceededError } from '../utils/errors';
import { PlanType, SubscriptionStatus } from '@prisma/client';

// Define limits for each plan
const PLAN_LIMITS: Record<PlanType, SubscriptionLimits> = {
  [PlanType.FREE]: {
    maxResumes: 1,
    maxVersionsPerResume: 3,
    coverLettersEnabled: false,
    atsSimulatorEnabled: false,
    customTemplatesEnabled: false,
    anonymizationEnabled: false,
  },
  [PlanType.PRO]: {
    maxResumes: 10,
    maxVersionsPerResume: -1, // Unlimited
    coverLettersEnabled: true,
    atsSimulatorEnabled: true,
    customTemplatesEnabled: true,
    anonymizationEnabled: false,
  },
  [PlanType.BUSINESS]: {
    maxResumes: -1, // Unlimited (per org quota)
    maxVersionsPerResume: -1,
    coverLettersEnabled: true,
    atsSimulatorEnabled: true,
    customTemplatesEnabled: true,
    anonymizationEnabled: true,
  },
};

// Get subscription limits for user
export const getSubscriptionLimits = (planType: PlanType): SubscriptionLimits => {
  return PLAN_LIMITS[planType];
};

// Check if subscription is active
export const requireActiveSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new SubscriptionError('Authentication required'));
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
    });

    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      return next(new SubscriptionError('Active subscription required'));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Require Pro or Business plan
export const requireProPlan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new SubscriptionError('Authentication required'));
    }

    if (req.user.planType === PlanType.FREE) {
      return next(new SubscriptionError(
        'This feature requires a Pro or Business plan. Upgrade to access premium features.'
      ));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Check resume quota
export const checkResumeQuota = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new SubscriptionError('Authentication required'));
    }

    const limits = getSubscriptionLimits(req.user.planType);

    // Unlimited resumes
    if (limits.maxResumes === -1) {
      return next();
    }

    // Check for B2B org limits
    if (req.user.organizationId) {
      const org = await prisma.organization.findUnique({
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
    const resumeCount = await prisma.resume.count({
      where: { userId: req.user.id },
    });

    if (resumeCount >= limits.maxResumes) {
      // Generate plan-specific upgrade message
      const currentPlan = req.user.planType;
      const upgradeMessage = currentPlan === PlanType.FREE
        ? 'Upgrade to Pro for up to 10 resumes or Business for unlimited resumes.'
        : 'Upgrade to Business for unlimited resumes.';

      return next(new QuotaExceededError(
        `You've reached your plan's resume limit (${resumeCount}/${limits.maxResumes}). ${upgradeMessage}`
      ));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Check cover letter access
export const checkCoverLetterAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new SubscriptionError('Authentication required'));
    }

    const limits = getSubscriptionLimits(req.user.planType);

    if (!limits.coverLettersEnabled) {
      const currentPlan = req.user.planType;
      const availablePlans = currentPlan === PlanType.FREE
        ? 'Pro or Business plan'
        : 'Business plan';

      return next(new SubscriptionError(
        `Cover letter generation is not available on your current plan. Upgrade to ${availablePlans} to unlock this feature.`
      ));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Check ATS simulator access
export const checkATSSimulatorAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new SubscriptionError('Authentication required'));
    }

    const limits = getSubscriptionLimits(req.user.planType);

    if (!limits.atsSimulatorEnabled) {
      const currentPlan = req.user.planType;
      const availablePlans = currentPlan === PlanType.FREE
        ? 'Pro or Business plan'
        : 'Business plan';

      return next(new SubscriptionError(
        `ATS Simulator is not available on your current plan. Upgrade to ${availablePlans} to unlock this feature.`
      ));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Check anonymization access (B2B only)
export const checkAnonymizationAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new SubscriptionError('Authentication required'));
    }

    const limits = getSubscriptionLimits(req.user.planType);

    if (!limits.anonymizationEnabled) {
      return next(new SubscriptionError(
        `Anonymization feature is only available on the Business plan. Upgrade to Business to mask candidate information for recruiting purposes.`
      ));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Track AI usage for cost management
export const trackAIUsage = async (
  userId: string,
  organizationId: string | null | undefined,
  operation: string,
  provider: string,
  model: string,
  promptTokens: number,
  completionTokens: number,
  durationMs: number,
  success: boolean = true,
  errorMessage?: string
): Promise<void> => {
  // Estimate cost based on provider and model
  const costPerInputToken = provider === 'anthropic' ? 0.000003 : 0.00001;
  const costPerOutputToken = provider === 'anthropic' ? 0.000015 : 0.00003;
  const estimatedCost = (promptTokens * costPerInputToken) + (completionTokens * costPerOutputToken);

  await prisma.aIUsageLog.create({
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
