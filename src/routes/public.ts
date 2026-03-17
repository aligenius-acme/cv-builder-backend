import { Router } from 'express';
import { isProEnabled } from '../config/appSettings';

const router = Router();

/**
 * GET /api/public/settings
 * No authentication required. Returns feature flags the frontend needs
 * before a user is logged in (e.g. to show/hide the pricing page link).
 */
router.get('/settings', async (_req, res) => {
  try {
    const proSubscriptionEnabled = await isProEnabled();
    res.json({ success: true, data: { proSubscriptionEnabled } });
  } catch {
    res.json({ success: true, data: { proSubscriptionEnabled: false } });
  }
});

export default router;
