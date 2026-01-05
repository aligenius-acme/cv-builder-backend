import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  checkText,
  checkResume,
  getLanguages,
} from '../controllers/grammar';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Check text for grammar issues
router.post('/check', checkText);

// Check resume sections
router.post('/check-resume', checkResume);

// Get supported languages
router.get('/languages', getLanguages);

export default router;
