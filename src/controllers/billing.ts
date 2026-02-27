import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || '';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

/** POST /api/billing/checkout — create Stripe Checkout session */
export const createCheckoutSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!stripe) {
      res.status(503).json({ success: false, error: 'Payment system not configured' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { email: true, stripeCustomerId: true, plan: true },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    if (user.plan === 'PRO') {
      res.status(400).json({ success: false, error: 'You are already on the Pro plan' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
      customer: user.stripeCustomerId || undefined,
      customer_email: user.stripeCustomerId ? undefined : user.email,
      success_url: `${FRONTEND_URL}/settings/billing?success=true`,
      cancel_url: `${FRONTEND_URL}/pricing`,
      metadata: { userId: req.user!.id },
    });

    res.json({ success: true, data: { url: session.url } });
  } catch (error) {
    next(error);
  }
};

/** POST /api/billing/portal — create Stripe Customer Portal session */
export const createPortalSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!stripe) {
      res.status(503).json({ success: false, error: 'Payment system not configured' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      res.status(400).json({ success: false, error: 'No active subscription found' });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${FRONTEND_URL}/settings/billing`,
    });

    res.json({ success: true, data: { url: session.url } });
  } catch (error) {
    next(error);
  }
};

/** GET /api/billing/status — return current plan info */
export const getBillingStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        plan: true,
        aiCredits: true,
        aiCreditsUsed: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const remainingCredits =
      user.plan === 'PRO' ? -1 : user.aiCredits - user.aiCreditsUsed;

    res.json({
      success: true,
      data: {
        plan: user.plan,
        remainingCredits,
        stripeCustomerId: user.stripeCustomerId,
        hasSubscription: !!user.stripeSubscriptionId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/** POST /api/billing/webhook — Stripe webhook (no auth, raw body) */
export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!stripe || !WEBHOOK_SECRET) {
    res.status(200).send('Webhook not configured');
    return;
  }

  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature error:', err);
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.customer_email) {
          await prisma.user.updateMany({
            where: { email: session.customer_email },
            data: {
              plan: 'PRO',
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            },
          });
          console.log(`✅ User ${session.customer_email} upgraded to PRO`);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { stripeCustomerId: sub.customer as string },
          data: { plan: 'FREE', stripeSubscriptionId: null },
        });
        console.log(`ℹ️  Subscription cancelled for customer ${sub.customer}`);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await prisma.user.updateMany({
          where: { stripeCustomerId: invoice.customer as string },
          data: { plan: 'FREE' },
        });
        console.log(`⚠️  Payment failed for customer ${invoice.customer} — downgraded to FREE`);
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};
