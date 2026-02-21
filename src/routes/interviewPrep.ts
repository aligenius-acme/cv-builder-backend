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

const router = Router();

// All routes require authentication, AI routes are rate limited
router.post('/generate', authenticate, aiLimiter, validateBody(interviewPrepSchema), generateQuestions);
router.post('/evaluate', authenticate, aiLimiter, evaluateAnswer);
router.get('/common', authenticate, getCommonQuestions);

export default router;
