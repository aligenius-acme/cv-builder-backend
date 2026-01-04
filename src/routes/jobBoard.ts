import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  searchJobs,
  getJobDetails,
  saveJob,
  getSavedJobs,
  getRecommendedJobs,
} from '../controllers/jobBoard';

const router = Router();

// All routes require authentication
router.get('/search', authenticate, searchJobs);
router.get('/details/:id', authenticate, getJobDetails);
router.post('/save', authenticate, saveJob);
router.get('/saved', authenticate, getSavedJobs);
router.get('/recommended', authenticate, getRecommendedJobs);

export default router;
