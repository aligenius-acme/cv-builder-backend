import { Router } from 'express';
import {
  getPerformanceMetrics,
  getEndpointMetrics,
  getCacheMetrics,
  healthCheck,
  clearCache,
} from '../controllers/monitoring';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/roleCheck';

const router = Router();

// Public health check
router.get('/health', healthCheck);

// Protected monitoring endpoints (require authentication)
router.get('/performance', authenticate, getPerformanceMetrics);
router.get('/cache', authenticate, getCacheMetrics);
router.get('/endpoint/:path', authenticate, getEndpointMetrics);

// Admin-only endpoints
router.post('/cache/clear', authenticate, isAdmin, clearCache);

export default router;
