import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getResumePerformanceScore,
  analyzeSkillGap,
  getResumeExamples,
  getCareerDashboardStats,
} from '../controllers/careerTools';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public route - resume examples don't require auth
router.get('/examples', getResumeExamples);

// Protected routes
router.use(authenticate);

// Career Dashboard
router.get('/dashboard-stats', getCareerDashboardStats);

// Resume Performance Score (AI-powered, rate limited)
router.get('/performance-score/:resumeId', aiLimiter, getResumePerformanceScore);
router.get('/performance-score/:resumeId/version/:versionId', aiLimiter, getResumePerformanceScore);

// Skill Gap Analyzer (AI-powered, rate limited)
router.post('/skill-gap', aiLimiter, analyzeSkillGap);

export default router;
