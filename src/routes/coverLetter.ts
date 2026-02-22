import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  generateCoverLetter,
  getCoverLetters,
  getCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
  downloadCoverLetter,
  regenerateCoverLetter,
  generateEnhancedCoverLetter,
} from '../controllers/coverLetter';
import { aiLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import { coverLetterSchema, coverLetterUpdateSchema } from '../validation/schemas';
import { checkAICredits } from '../middleware/credits';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Cover letter operations with rate limiting, credit check, and validation
router.post('/', aiLimiter, checkAICredits, validateBody(coverLetterSchema), generateCoverLetter);
router.post('/enhanced', aiLimiter, checkAICredits, validateBody(coverLetterSchema), generateEnhancedCoverLetter); // Enhanced with alternatives
router.get('/', getCoverLetters);
router.get('/:id', getCoverLetter);
router.put('/:id', validateBody(coverLetterUpdateSchema), updateCoverLetter);
router.delete('/:id', deleteCoverLetter);
router.get('/:id/download', downloadCoverLetter);
router.post('/:id/regenerate', aiLimiter, checkAICredits, regenerateCoverLetter);

export default router;
