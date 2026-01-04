import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTests,
  getTest,
  createTest,
  updateTest,
  updateTestStatus,
  deleteTest,
  recordEvent,
  addVariant,
  removeVariant,
  getTestAnalytics,
  updateVariantMetrics,
} from '../controllers/abTesting';

const router = Router();

// Public route - record events from shared links
router.post('/event/:shareToken', recordEvent);

// Protected routes
router.use(authenticate);

// Test CRUD
router.get('/', getTests);
router.get('/:id', getTest);
router.post('/', createTest);
router.put('/:id', updateTest);
router.delete('/:id', deleteTest);

// Test status management
router.patch('/:id/status', updateTestStatus);

// Variant management
router.post('/:id/variants', addVariant);
router.delete('/:id/variants/:variantId', removeVariant);
router.patch('/:id/variants/:variantId/metrics', updateVariantMetrics);

// Analytics
router.get('/:id/analytics', getTestAnalytics);

export default router;
