import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  toggleSharing,
  getSharingStatus,
  viewSharedResume,
  downloadSharedResume,
} from '../controllers/share';

const router = Router();

// Public routes (no auth required)
router.get('/:token', viewSharedResume);
router.get('/:token/download', downloadSharedResume);

// Protected routes (auth required)
router.post('/:resumeId/versions/:versionId/share', authenticate, toggleSharing);
router.get('/:resumeId/versions/:versionId/share', authenticate, getSharingStatus);

export default router;
