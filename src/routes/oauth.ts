import { Router } from 'express';
import {
  getOAuthUrls,
  googleCallback,
  githubCallback,
} from '../controllers/oauth';

const router = Router();

// Get available OAuth providers and URLs
router.get('/providers', getOAuthUrls);

// OAuth callbacks (exchange code for token)
router.post('/google/callback', googleCallback);
router.post('/github/callback', githubCallback);

export default router;
