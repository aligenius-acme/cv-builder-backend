import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  updateStatus,
  reorderApplications,
  deleteApplication,
  addActivity,
  getStats,
} from '../controllers/jobTracker';
import { validateBody } from '../middleware/validate';
import { jobApplicationSchema, jobApplicationUpdateSchema } from '../validation/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Statistics
router.get('/stats', getStats);

// CRUD operations with validation
router.get('/', getApplications);
router.get('/:id', getApplication);
router.post('/', validateBody(jobApplicationSchema), createApplication);
router.put('/:id', validateBody(jobApplicationUpdateSchema), updateApplication);
router.delete('/:id', deleteApplication);

// Status and ordering (for Kanban drag-and-drop)
router.patch('/:id/status', updateStatus);
router.post('/reorder', reorderApplications);

// Activity log
router.post('/:id/activity', addActivity);

export default router;
