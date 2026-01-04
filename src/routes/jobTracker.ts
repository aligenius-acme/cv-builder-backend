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

const router = Router();

// All routes require authentication
router.use(authenticate);

// Statistics
router.get('/stats', getStats);

// CRUD operations
router.get('/', getApplications);
router.get('/:id', getApplication);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

// Status and ordering (for Kanban drag-and-drop)
router.patch('/:id/status', updateStatus);
router.post('/reorder', reorderApplications);

// Activity log
router.post('/:id/activity', addActivity);

export default router;
