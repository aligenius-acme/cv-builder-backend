import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  generateQuestions,
  evaluateAnswer,
  getCommonQuestions,
} from '../controllers/interviewPrep';

const router = Router();

// All routes require authentication
router.post('/generate', authenticate, generateQuestions);
router.post('/evaluate', authenticate, evaluateAnswer);
router.get('/common', authenticate, getCommonQuestions);

export default router;
