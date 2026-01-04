import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getSuggestions,
  getCompletions,
  generateBulletPoints,
} from '../controllers/aiWriting';

const router = Router();

// All routes require authentication
router.post('/suggestions', authenticate, getSuggestions);
router.post('/completions', authenticate, getCompletions);
router.post('/generate-bullets', authenticate, generateBulletPoints);

export default router;
