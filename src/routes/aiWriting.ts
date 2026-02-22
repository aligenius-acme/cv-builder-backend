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
import { checkAICredits } from '../middleware/credits';

const router = Router();

// All routes require authentication, are rate limited and credit checked (AI-powered)
router.post('/suggestions', authenticate, aiLimiter, checkAICredits, validateBody(aiWritingSchema), getSuggestions);
router.post('/completions', authenticate, aiLimiter, checkAICredits, validateBody(aiWritingSchema), getCompletions);
router.post('/generate-bullets', authenticate, aiLimiter, checkAICredits, validateBody(aiWritingSchema), generateBulletPoints);

export default router;
