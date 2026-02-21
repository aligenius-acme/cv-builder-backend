import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getSuggestions,
  getCompletions,
  generateBulletPoints,
} from '../controllers/aiWriting';
import { aiLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import { aiWritingSchema } from '../validation/schemas';

const router = Router();

// All routes require authentication and are rate limited (AI-powered)
router.post('/suggestions', authenticate, aiLimiter, validateBody(aiWritingSchema), getSuggestions);
router.post('/completions', authenticate, aiLimiter, validateBody(aiWritingSchema), getCompletions);
router.post('/generate-bullets', authenticate, aiLimiter, validateBody(aiWritingSchema), generateBulletPoints);

export default router;
