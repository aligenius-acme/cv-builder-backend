import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  analyzeSalary,
  compareOffers,
  getNegotiationScript,
} from '../controllers/salaryAnalyzer';

const router = Router();

// All routes require authentication
router.post('/analyze', authenticate, analyzeSalary);
router.post('/compare', authenticate, compareOffers);
router.post('/negotiation-script', authenticate, getNegotiationScript);

export default router;
