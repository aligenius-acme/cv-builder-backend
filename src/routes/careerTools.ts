import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getResumePerformanceScore,
  analyzeSkillGap,
  getResumeExamples,
  getCareerDashboardStats,
} from '../controllers/careerTools';

const router = Router();

// Public route - resume examples don't require auth
router.get('/examples', getResumeExamples);

// Protected routes
router.use(authenticate);

// Career Dashboard
router.get('/dashboard-stats', getCareerDashboardStats);

// Resume Performance Score
router.get('/performance-score/:resumeId', getResumePerformanceScore);
router.get('/performance-score/:resumeId/version/:versionId', getResumePerformanceScore);

// Skill Gap Analyzer
router.post('/skill-gap', analyzeSkillGap);

export default router;
