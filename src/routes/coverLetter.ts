import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { checkCoverLetterAccess } from '../middleware/subscription';
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

const router = Router();

// All routes require authentication and Pro subscription
router.use(authenticate);
router.use(checkCoverLetterAccess);

// Cover letter operations with rate limiting and validation
router.post('/', aiLimiter, validateBody(coverLetterSchema), generateCoverLetter);
router.post('/enhanced', aiLimiter, validateBody(coverLetterSchema), generateEnhancedCoverLetter); // Enhanced with alternatives
router.get('/', getCoverLetters);
router.get('/:id', getCoverLetter);
router.put('/:id', validateBody(coverLetterUpdateSchema), updateCoverLetter);
router.delete('/:id', deleteCoverLetter);
router.get('/:id/download', downloadCoverLetter);
router.post('/:id/regenerate', aiLimiter, regenerateCoverLetter);

export default router;
