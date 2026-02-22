import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  generateQuestions,
  evaluateAnswer,
  getCommonQuestions,
} from '../controllers/interviewPrep';
import { aiLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import { interviewPrepSchema } from '../validation/schemas';
import { checkAICredits } from '../middleware/credits';

const router = Router();

// All routes require authentication, AI routes are rate limited and credit checked
router.post('/generate', authenticate, aiLimiter, checkAICredits, validateBody(interviewPrepSchema), generateQuestions);
router.post('/evaluate', authenticate, aiLimiter, checkAICredits, evaluateAnswer);
router.get('/common', authenticate, getCommonQuestions);

export default router;
