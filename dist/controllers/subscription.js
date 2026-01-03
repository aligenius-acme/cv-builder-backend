"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsage = exports.getPlans = exports.webhook = exports.reactivate = exports.cancel = exports.createPortal = exports.createCheckout = exports.getSubscription = void 0;
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const stripe_1 = require("../services/stripe");
const config_1 = __importDefault(require("../config"));
// Get current subscription
const getSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const subscription = await prisma_1.prisma.subscription.findUnique({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getSubscription = getSubscription;
// Create checkout session for upgrade
const createCheckout = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { planType } = req.body;
        if (!planType || !['pro', 'business'].includes(planType)) {
            throw new errors_1.ValidationError('Valid plan type is required (pro or business)');
        }
        const successUrl = `${config_1.default.frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${config_1.default.frontendUrl}/subscription/cancel`;
        const checkoutUrl = await (0, stripe_1.createCheckoutSession)(userId, planType, successUrl, cancelUrl);
        res.json({
            success: true,
            data: {
                checkoutUrl,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCheckout = createCheckout;
// Create customer portal session
const createPortal = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const returnUrl = `${config_1.default.frontendUrl}/settings/subscription`;
        const portalUrl = await (0, stripe_1.createPortalSession)(userId, returnUrl);
        res.json({
            success: true,
            data: {
                portalUrl,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPortal = createPortal;
// Cancel subscription
const cancel = async (req, res, next) => {
    try {
        const userId = req.user.id;
        await (0, stripe_1.cancelSubscription)(userId);
        res.json({
            success: true,
            message: 'Subscription will be canceled at the end of the current billing period',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.cancel = cancel;
// Reactivate subscription
const reactivate = async (req, res, next) => {
    try {
        const userId = req.user.id;
        await (0, stripe_1.reactivateSubscription)(userId);
        res.json({
            success: true,
            message: 'Subscription reactivated successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.reactivate = reactivate;
// Handle Stripe webhook
const webhook = async (req, res, next) => {
    try {
        const signature = req.headers['stripe-signature'];
        if (!signature) {
            throw new errors_1.ValidationError('Missing Stripe signature');
        }
        await (0, stripe_1.handleWebhookEvent)(req.body, signature);
        res.json({ received: true });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};
exports.webhook = webhook;
// Get available plans
const getPlans = async (req, res, next) => {
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
                        stripePriceId: config_1.default.stripe.proPriceId,
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
                        stripePriceId: config_1.default.stripe.businessPriceId,
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
    }
    catch (error) {
        next(error);
    }
};
exports.getPlans = getPlans;
// Get usage statistics
const getUsage = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [subscription, resumeCount, coverLetterCount, aiUsage] = await Promise.all([
            prisma_1.prisma.subscription.findUnique({ where: { userId } }),
            prisma_1.prisma.resume.count({ where: { userId } }),
            prisma_1.prisma.coverLetter.count({ where: { userId } }),
            prisma_1.prisma.aIUsageLog.aggregate({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getUsage = getUsage;
//# sourceMappingURL=subscription.js.map