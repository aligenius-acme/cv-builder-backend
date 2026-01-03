import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';
import { ValidationError, NotFoundError } from '../utils/errors';
import {
  createCheckoutSession,
  createPortalSession,
  handleWebhookEvent,
  cancelSubscription,
  reactivateSubscription,
  getSubscriptionInfo,
} from '../services/stripe';
import config from '../config';

// Get current subscription
export const getSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      res.json({
        success: true,
        data: {
          planType: 'FREE',
          status: 'ACTIVE',
          features: {
            maxResumes: 1,
            coverLettersEnabled: false,
            atsSimulatorEnabled: false,
          },
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        planType: subscription.planType,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        resumeLimit: subscription.resumeLimit,
        resumesCreated: subscription.resumesCreated,
        features: {
          maxResumes: subscription.resumeLimit === -1 ? 'Unlimited' : subscription.resumeLimit,
          coverLettersEnabled: subscription.planType !== 'FREE',
          atsSimulatorEnabled: subscription.planType !== 'FREE',
          anonymizationEnabled: subscription.planType === 'BUSINESS',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create checkout session for upgrade
export const createCheckout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { planType } = req.body;

    if (!planType || !['pro', 'business'].includes(planType)) {
      throw new ValidationError('Valid plan type is required (pro or business)');
    }

    const successUrl = `${config.frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${config.frontendUrl}/subscription/cancel`;

    const checkoutUrl = await createCheckoutSession(
      userId,
      planType as 'pro' | 'business',
      successUrl,
      cancelUrl
    );

    res.json({
      success: true,
      data: {
        checkoutUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create customer portal session
export const createPortal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const returnUrl = `${config.frontendUrl}/settings/subscription`;

    const portalUrl = await createPortalSession(userId, returnUrl);

    res.json({
      success: true,
      data: {
        portalUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Cancel subscription
export const cancel = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    await cancelSubscription(userId);

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period',
    });
  } catch (error) {
    next(error);
  }
};

// Reactivate subscription
export const reactivate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    await reactivateSubscription(userId);

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Handle Stripe webhook
export const webhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      throw new ValidationError('Missing Stripe signature');
    }

    await handleWebhookEvent(req.body, signature);

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
};

// Get available plans
export const getPlans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.json({
      success: true,
      data: {
        plans: [
          {
            id: 'free',
            name: 'Free',
            price: 0,
            interval: null,
            features: [
              '1 Resume',
              'Basic resume parsing',
              '3 job-specific versions',
              'ATS score (basic)',
              'PDF/DOCX download',
            ],
            limitations: [
              'No cover letters',
              'No ATS simulator',
              'No premium templates',
            ],
          },
          {
            id: 'pro',
            name: 'Pro',
            price: 19.99,
            interval: 'month',
            stripePriceId: config.stripe.proPriceId,
            features: [
              '10 Resumes',
              'Unlimited job-specific versions',
              'AI Cover Letter Generator',
              'Full ATS Simulator',
              'Premium templates',
              'Priority support',
              'Truth Guard warnings',
            ],
            popular: true,
          },
          {
            id: 'business',
            name: 'Business',
            price: 49.99,
            interval: 'month',
            stripePriceId: config.stripe.businessPriceId,
            features: [
              'Everything in Pro',
              'Unlimited resumes',
              'Anonymization for recruiting',
              'Custom branded templates',
              'Team management',
              'API access',
              'Dedicated support',
            ],
            forTeams: true,
          },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get usage statistics
export const getUsage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const [subscription, resumeCount, coverLetterCount, aiUsage] = await Promise.all([
      prisma.subscription.findUnique({ where: { userId } }),
      prisma.resume.count({ where: { userId } }),
      prisma.coverLetter.count({ where: { userId } }),
      prisma.aIUsageLog.aggregate({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setDate(1)), // Start of current month
          },
        },
        _sum: {
          totalTokens: true,
          estimatedCost: true,
        },
        _count: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        resumes: {
          used: resumeCount,
          limit: subscription?.resumeLimit || 1,
          unlimited: subscription?.resumeLimit === -1,
        },
        coverLetters: {
          count: coverLetterCount,
        },
        aiUsage: {
          requests: aiUsage._count,
          tokensUsed: aiUsage._sum.totalTokens || 0,
          estimatedCost: Number(aiUsage._sum.estimatedCost || 0).toFixed(2),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
