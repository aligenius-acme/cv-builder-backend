import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';
import { checkAICredits } from '../middleware/credits';
import {
  analyzeSalary,
  compareOffers,
  getNegotiationScript,
} from '../controllers/salaryAnalyzer';

const router = Router();

// All routes require authentication
router.post('/analyze', authenticate, aiLimiter, checkAICredits, analyzeSalary);
router.post('/compare', authenticate, compareOffers);
router.post('/negotiation-script', authenticate, aiLimiter, checkAICredits, getNegotiationScript);

export default router;
