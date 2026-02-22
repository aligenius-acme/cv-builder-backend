import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getResumePerformanceScore,
  analyzeSkillGap,
  getResumeExamples,
  getCareerDashboardStats,
} from '../controllers/careerTools';
import { aiLimiter } from '../middleware/rateLimiter';
import { checkAICredits } from '../middleware/credits';

const router = Router();

// Public route - resume examples don't require auth
router.get('/examples', getResumeExamples);

// Protected routes
router.use(authenticate);

// Career Dashboard
router.get('/dashboard-stats', getCareerDashboardStats);

// Resume Performance Score (AI-powered, rate limited)
router.get('/performance-score/:resumeId', aiLimiter, checkAICredits, getResumePerformanceScore);
router.get('/performance-score/:resumeId/version/:versionId', aiLimiter, checkAICredits, getResumePerformanceScore);

// Skill Gap Analyzer (AI-powered, rate limited)
router.post('/skill-gap', aiLimiter, checkAICredits, analyzeSkillGap);

export default router;
