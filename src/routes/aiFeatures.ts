import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  calculateJobMatch,
  quantifyAchievements,
  detectWeaknesses,
  generateFollowUpEmail,
  generateNetworkingMessage,
  quickJobMatch,
} from '../controllers/aiFeatures';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication and are AI-powered (rate limited)
router.use(authenticate);

// Job Match Score - calculate compatibility before applying
router.post('/job-match', aiLimiter, calculateJobMatch);

// Quick job match from tracked job
router.get('/job-match/:jobId', aiLimiter, quickJobMatch);

// Achievement Quantifier - convert vague bullets to metrics
router.post('/quantify-achievements', aiLimiter, quantifyAchievements);

// Weakness Detector - find red flags in resume
router.post('/weakness-detector', aiLimiter, detectWeaknesses);

// Follow-up Email Generator
router.post('/follow-up-email', aiLimiter, generateFollowUpEmail);

// Networking Message Generator
router.post('/networking-message', aiLimiter, generateNetworkingMessage);

export default router;
