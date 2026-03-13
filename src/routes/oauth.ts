import { Router } from 'express';
import {
  getOAuthUrls,
  googleCallback,
  githubCallback,
} from '../controllers/oauth';
import { oauthLimiter } from '../middleware/rateLimiter';

const router = Router();

// Get available OAuth providers and URLs
router.get('/providers', getOAuthUrls);

// OAuth callbacks (exchange code for token) — rate limited to prevent brute-force
router.post('/google/callback', oauthLimiter, googleCallback);
router.post('/github/callback', oauthLimiter, githubCallback);

export default router;
