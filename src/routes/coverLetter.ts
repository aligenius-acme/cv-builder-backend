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
} from '../controllers/coverLetter';

const router = Router();

// All routes require authentication and Pro subscription
router.use(authenticate);
router.use(checkCoverLetterAccess);

// Cover letter operations
router.post('/', generateCoverLetter);
router.get('/', getCoverLetters);
router.get('/:id', getCoverLetter);
router.put('/:id', updateCoverLetter);
router.delete('/:id', deleteCoverLetter);
router.get('/:id/download', downloadCoverLetter);
router.post('/:id/regenerate', regenerateCoverLetter);

export default router;
