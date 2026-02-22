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
import { checkAICredits } from '../middleware/credits';

const router = Router();

// All routes require authentication and are AI-powered (rate limited, credit checked)
router.use(authenticate);

// Job Match Score - calculate compatibility before applying
router.post('/job-match', aiLimiter, checkAICredits, calculateJobMatch);

// Quick job match from tracked job
router.get('/job-match/:jobId', aiLimiter, checkAICredits, quickJobMatch);

// Achievement Quantifier - convert vague bullets to metrics
router.post('/quantify-achievements', aiLimiter, checkAICredits, quantifyAchievements);

// Weakness Detector - find red flags in resume
router.post('/weakness-detector', aiLimiter, checkAICredits, detectWeaknesses);

// Follow-up Email Generator
router.post('/follow-up-email', aiLimiter, checkAICredits, generateFollowUpEmail);

// Networking Message Generator
router.post('/networking-message', aiLimiter, checkAICredits, generateNetworkingMessage);

export default router;
