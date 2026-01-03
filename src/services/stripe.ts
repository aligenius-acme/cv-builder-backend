import Stripe from 'stripe';
import config from '../config';
import { prisma } from '../utils/prisma';
import { PlanType, SubscriptionStatus } from '@prisma/client';

// Initialize Stripe only if API key is provided
const stripe = config.stripe.secretKey
  ? new Stripe(config.stripe.secretKey)
  : null;

// Helper to check if Stripe is configured
function ensureStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment.');
  }
  return stripe;
}

// Create Stripe customer for user
export async function createCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const stripeClient = ensureStripe();
  const customer = await stripeClient.customers.create({
    email,
    name: name || undefined,
    metadata: { userId },
  });

  await prisma.subscription.update({
    where: { userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// Create checkout session for subscription
export async function createCheckoutSession(
  userId: string,
  planType: 'pro' | 'business',
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const user = await prisma.user.findUnique({
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

  const priceId = planType === 'pro' ? config.stripe.proPriceId : config.stripe.businessPriceId;

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

  return session.url!;
}

// Create customer portal session
export async function createPortalSession(
  userId: string,
  returnUrl: string
): Promise<string> {
  const subscription = await prisma.subscription.findUnique({
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
export async function handleWebhookEvent(
  payload: Buffer,
  signature: string
): Promise<void> {
  const stripeClient = ensureStripe();
  const event = stripeClient.webhooks.constructEvent(
    payload,
    signature,
    config.stripe.webhookSecret
  );

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
  }
}

// Handle successful checkout
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType as 'pro' | 'business';

  if (!userId) return;

  await prisma.subscription.update({
    where: { userId },
    data: {
      stripeSubscriptionId: session.subscription as string,
      planType: planType === 'pro' ? PlanType.PRO : PlanType.BUSINESS,
      status: SubscriptionStatus.ACTIVE,
      resumeLimit: planType === 'pro' ? 10 : -1, // -1 for unlimited
    },
  });
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const status = mapStripeStatus(subscription.status);
  const planType = subscription.metadata?.planType as 'pro' | 'business' | undefined;

  // Access period dates from the subscription object
  const subAny = subscription as any;
  const periodStart = subAny.current_period_start;
  const periodEnd = subAny.current_period_end;

  await prisma.subscription.update({
    where: { userId },
    data: {
      status,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      ...(periodStart && { currentPeriodStart: new Date(periodStart * 1000) }),
      ...(periodEnd && { currentPeriodEnd: new Date(periodEnd * 1000) }),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      ...(planType && {
        planType: planType === 'pro' ? PlanType.PRO : PlanType.BUSINESS,
      }),
    },
  });
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: SubscriptionStatus.CANCELED,
      planType: PlanType.FREE,
      stripeSubscriptionId: null,
      stripePriceId: null,
      resumeLimit: 1,
    },
  });
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.PAST_DUE },
    });
  }
}

// Handle successful invoice payment
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (subscription && subscription.status === SubscriptionStatus.PAST_DUE) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.ACTIVE },
    });
  }
}

// Map Stripe status to our status
function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return SubscriptionStatus.ACTIVE;
    case 'canceled':
      return SubscriptionStatus.CANCELED;
    case 'past_due':
      return SubscriptionStatus.PAST_DUE;
    case 'trialing':
      return SubscriptionStatus.TRIALING;
    case 'paused':
      return SubscriptionStatus.PAUSED;
    default:
      return SubscriptionStatus.ACTIVE;
  }
}

// Cancel subscription
export async function cancelSubscription(userId: string): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeSubscriptionId) {
    throw new Error('No active subscription found');
  }

  const stripeClient = ensureStripe();
  await stripeClient.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.subscription.update({
    where: { userId },
    data: { cancelAtPeriodEnd: true },
  });
}

// Reactivate subscription
export async function reactivateSubscription(userId: string): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeSubscriptionId) {
    throw new Error('No subscription found');
  }

  const stripeClient = ensureStripe();
  await stripeClient.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await prisma.subscription.update({
    where: { userId },
    data: { cancelAtPeriodEnd: false },
  });
}

// Get subscription info
export async function getSubscriptionInfo(userId: string): Promise<{
  planType: PlanType;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  return {
    planType: subscription?.planType || PlanType.FREE,
    status: subscription?.status || SubscriptionStatus.ACTIVE,
    currentPeriodEnd: subscription?.currentPeriodEnd || undefined,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
  };
}

// B2B: Create checkout for organization
export async function createOrgCheckoutSession(
  organizationId: string,
  seats: number,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const org = await prisma.organization.findUnique({
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

    await prisma.orgSubscription.upsert({
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
        price: config.stripe.businessPriceId,
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

  return session.url!;
}
