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

// Handle OAuth cancellation/errors (GET) — redirect to frontend
router.get('/google/callback', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const error = req.query.error as string | undefined;
  res.redirect(`${frontendUrl}/auth/google/callback${error ? `?error=${encodeURIComponent(error)}` : ''}`);
});
router.get('/github/callback', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const error = req.query.error as string | undefined;
  res.redirect(`${frontendUrl}/auth/github/callback${error ? `?error=${encodeURIComponent(error)}` : ''}`);
});

// OAuth callbacks (exchange code for token) — rate limited to prevent brute-force
router.post('/google/callback', oauthLimiter, googleCallback);
router.post('/github/callback', oauthLimiter, githubCallback);

export default router;
