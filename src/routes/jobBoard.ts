import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';
import { checkAICredits } from '../middleware/credits';
import {
  searchJobs,
  getJobDetails,
  saveJob,
  getSavedJobs,
  deleteSavedJob,
  getRecommendedJobs,
} from '../controllers/jobBoard';

const router = Router();

// All routes require authentication
router.get('/search', authenticate, searchJobs);
router.get('/details/:id', authenticate, aiLimiter, checkAICredits, getJobDetails);
router.post('/save', authenticate, saveJob);
router.get('/saved', authenticate, getSavedJobs);
router.delete('/saved/:jobId', authenticate, deleteSavedJob);
router.get('/recommended', authenticate, getRecommendedJobs);

export default router;
