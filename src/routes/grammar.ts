import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  checkText,
  checkResume,
  getLanguages,
} from '../controllers/grammar';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Check text for grammar issues (AI-powered, rate limited)
router.post('/check', aiLimiter, checkText);

// Check resume sections (AI-powered, rate limited)
router.post('/check-resume', aiLimiter, checkResume);

// Get supported languages (no rate limit needed)
router.get('/languages', getLanguages);

export default router;
