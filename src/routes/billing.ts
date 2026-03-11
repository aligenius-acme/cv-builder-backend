import { Router } from 'express';
import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createCheckoutSession,
  createPortalSession,
  getBillingStatus,
  claimMonthlyCredits,
  handleWebhook,
} from '../controllers/billing';

const router = Router();

// Webhook MUST use raw body for Stripe signature verification — register BEFORE json middleware
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

router.post('/checkout', authenticate, createCheckoutSession);
router.get('/status', authenticate, getBillingStatus);
router.post('/claim-credits', authenticate, claimMonthlyCredits);
router.post('/portal', authenticate, createPortalSession);

export default router;
