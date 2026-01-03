import { Router } from 'express';
import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getSubscription,
  createCheckout,
  createPortal,
  cancel,
  reactivate,
  webhook,
  getPlans,
  getUsage,
} from '../controllers/subscription';

const router = Router();

// Stripe webhook (needs raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

// Public routes
router.get('/plans', getPlans);

// Protected routes
router.get('/', authenticate, getSubscription);
router.post('/checkout', authenticate, createCheckout);
router.post('/portal', authenticate, createPortal);
router.post('/cancel', authenticate, cancel);
router.post('/reactivate', authenticate, reactivate);
router.get('/usage', authenticate, getUsage);

export default router;
