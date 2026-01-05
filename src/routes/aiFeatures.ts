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

const router = Router();

// All routes require authentication
router.use(authenticate);

// Job Match Score - calculate compatibility before applying
router.post('/job-match', calculateJobMatch);

// Quick job match from tracked job
router.get('/job-match/:jobId', quickJobMatch);

// Achievement Quantifier - convert vague bullets to metrics
router.post('/quantify-achievements', quantifyAchievements);

// Weakness Detector - find red flags in resume
router.post('/weakness-detector', detectWeaknesses);

// Follow-up Email Generator
router.post('/follow-up-email', generateFollowUpEmail);

// Networking Message Generator
router.post('/networking-message', generateNetworkingMessage);

export default router;
