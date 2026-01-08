"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomer = createCustomer;
exports.createCheckoutSession = createCheckoutSession;
exports.createPortalSession = createPortalSession;
exports.handleWebhookEvent = handleWebhookEvent;
exports.cancelSubscription = cancelSubscription;
exports.reactivateSubscription = reactivateSubscription;
exports.getSubscriptionInfo = getSubscriptionInfo;
exports.createOrgCheckoutSession = createOrgCheckoutSession;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../config"));
const prisma_1 = require("../utils/prisma");
const client_1 = require("@prisma/client");
// Initialize Stripe only if API key is provided
const stripe = config_1.default.stripe.secretKey
    ? new stripe_1.default(config_1.default.stripe.secretKey)
    : null;
// Helper to check if Stripe is configured
function ensureStripe() {
    if (!stripe) {
        throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment.');
    }
    return stripe;
}
// Create Stripe customer for user
async function createCustomer(userId, email, name) {
    const stripeClient = ensureStripe();
    const customer = await stripeClient.customers.create({
        email,
        name: name || undefined,
        metadata: { userId },
    });
    await prisma_1.prisma.subscription.update({
        where: { userId },
        data: { stripeCustomerId: customer.id },
    });
    return customer.id;
}
// Create checkout session for subscription
async function createCheckoutSession(userId, planType, successUrl, cancelUrl) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
    });
    if (!user) {
        throw new Error('User not found');
    }
    let customerId = user.subscription?.stripeCustomerId;
    // Create customer if doesn't exist
    if (!customerId) {
        customerId = await createCustomer(userId, user.email, `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined);
    }
    const priceId = planType === 'pro' ? config_1.default.stripe.proPriceId : config_1.default.stripe.businessPriceId;
    const stripeClient = ensureStripe();
    const session = await stripeClient.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId, planType },
        subscription_data: {
            metadata: { userId, planType },
        },
    });
    return session.url;
}
// Create customer portal session
async function createPortalSession(userId, returnUrl) {
    const subscription = await prisma_1.prisma.subscription.findUnique({
        where: { userId },
    });
    if (!subscription?.stripeCustomerId) {
        throw new Error('No Stripe customer found');
    }
    const stripeClient = ensureStripe();
    const session = await stripeClient.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: returnUrl,
    });
    return session.url;
}
// Handle webhook events
async function handleWebhookEvent(payload, signature) {
    const stripeClient = ensureStripe();
    const event = stripeClient.webhooks.constructEvent(payload, signature, config_1.default.stripe.webhookSecret);
    switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckoutCompleted(event.data.object);
            break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            await handleSubscriptionUpdated(event.data.object);
            break;
        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object);
            break;
        case 'invoice.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;
        case 'invoice.paid':
            await handleInvoicePaid(event.data.object);
            break;
    }
}
// Handle successful checkout
async function handleCheckoutCompleted(session) {
    const userId = session.metadata?.userId;
    const planType = session.metadata?.planType;
    if (!userId)
        return;
    await prisma_1.prisma.subscription.update({
        where: { userId },
        data: {
            stripeSubscriptionId: session.subscription,
            planType: planType === 'pro' ? client_1.PlanType.PRO : client_1.PlanType.BUSINESS,
            status: client_1.SubscriptionStatus.ACTIVE,
            resumeLimit: planType === 'pro' ? 10 : -1, // -1 for unlimited
        },
    });
}
// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId)
        return;
    const status = mapStripeStatus(subscription.status);
    const planType = subscription.metadata?.planType;
    // Access period dates from the subscription object
    const subAny = subscription;
    const periodStart = subAny.current_period_start;
    const periodEnd = subAny.current_period_end;
    await prisma_1.prisma.subscription.update({
        where: { userId },
        data: {
            status,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            ...(periodStart && { currentPeriodStart: new Date(periodStart * 1000) }),
            ...(periodEnd && { currentPeriodEnd: new Date(periodEnd * 1000) }),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            ...(planType && {
                planType: planType === 'pro' ? client_1.PlanType.PRO : client_1.PlanType.BUSINESS,
            }),
        },
    });
}
// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId)
        return;
    await prisma_1.prisma.subscription.update({
        where: { userId },
        data: {
            status: client_1.SubscriptionStatus.CANCELED,
            planType: client_1.PlanType.FREE,
            stripeSubscriptionId: null,
            stripePriceId: null,
            resumeLimit: 1,
        },
    });
}
// Handle failed payment
async function handlePaymentFailed(invoice) {
    const customerId = invoice.customer;
    const subscription = await prisma_1.prisma.subscription.findFirst({
        where: { stripeCustomerId: customerId },
    });
    if (subscription) {
        await prisma_1.prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: client_1.SubscriptionStatus.PAST_DUE },
        });
    }
}
// Handle successful invoice payment
async function handleInvoicePaid(invoice) {
    const customerId = invoice.customer;
    const subscription = await prisma_1.prisma.subscription.findFirst({
        where: { stripeCustomerId: customerId },
    });
    if (subscription && subscription.status === client_1.SubscriptionStatus.PAST_DUE) {
        await prisma_1.prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: client_1.SubscriptionStatus.ACTIVE },
        });
    }
}
// Map Stripe status to our status
function mapStripeStatus(stripeStatus) {
    switch (stripeStatus) {
        case 'active':
            return client_1.SubscriptionStatus.ACTIVE;
        case 'canceled':
            return client_1.SubscriptionStatus.CANCELED;
        case 'past_due':
            return client_1.SubscriptionStatus.PAST_DUE;
        case 'trialing':
            return client_1.SubscriptionStatus.TRIALING;
        case 'paused':
            return client_1.SubscriptionStatus.PAUSED;
        default:
            return client_1.SubscriptionStatus.ACTIVE;
    }
}
// Cancel subscription
async function cancelSubscription(userId) {
    const subscription = await prisma_1.prisma.subscription.findUnique({
        where: { userId },
    });
    if (!subscription?.stripeSubscriptionId) {
        throw new Error('No active subscription found');
    }
    const stripeClient = ensureStripe();
    await stripeClient.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
    });
    await prisma_1.prisma.subscription.update({
        where: { userId },
        data: { cancelAtPeriodEnd: true },
    });
}
// Reactivate subscription
async function reactivateSubscription(userId) {
    const subscription = await prisma_1.prisma.subscription.findUnique({
        where: { userId },
    });
    if (!subscription?.stripeSubscriptionId) {
        throw new Error('No subscription found');
    }
    const stripeClient = ensureStripe();
    await stripeClient.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
    });
    await prisma_1.prisma.subscription.update({
        where: { userId },
        data: { cancelAtPeriodEnd: false },
    });
}
// Get subscription info
async function getSubscriptionInfo(userId) {
    const subscription = await prisma_1.prisma.subscription.findUnique({
        where: { userId },
    });
    return {
        planType: subscription?.planType || client_1.PlanType.FREE,
        status: subscription?.status || client_1.SubscriptionStatus.ACTIVE,
        currentPeriodEnd: subscription?.currentPeriodEnd || undefined,
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
    };
}
// B2B: Create checkout for organization
async function createOrgCheckoutSession(organizationId, seats, successUrl, cancelUrl) {
    const org = await prisma_1.prisma.organization.findUnique({
        where: { id: organizationId },
        include: { subscription: true },
    });
    if (!org) {
        throw new Error('Organization not found');
    }
    let customerId = org.subscription?.stripeCustomerId;
    // Create customer if doesn't exist
    const stripeClient = ensureStripe();
    if (!customerId) {
        const customer = await stripeClient.customers.create({
            name: org.name,
            metadata: { organizationId },
        });
        customerId = customer.id;
        await prisma_1.prisma.orgSubscription.upsert({
            where: { organizationId },
            create: {
                organizationId,
                stripeCustomerId: customerId,
                seatsTotal: seats,
            },
            update: {
                stripeCustomerId: customerId,
            },
        });
    }
    const session = await stripeClient.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: config_1.default.stripe.businessPriceId,
                quantity: seats,
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { organizationId, seats: seats.toString() },
        subscription_data: {
            metadata: { organizationId, seats: seats.toString() },
        },
    });
    return session.url;
}
//# sourceMappingURL=stripe.js.map