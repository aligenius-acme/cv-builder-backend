import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getDashboard,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getOrganizations,
  getAIUsage,
  getParsingErrors,
  getAuditLogs,
  getPrompts,
  updatePrompt,
  createTemplate,
  getTemplates,
} from '../controllers/admin';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboard);

// Users management
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Organizations management
router.get('/organizations', getOrganizations);

// AI Usage monitoring
router.get('/ai-usage', getAIUsage);

// Error logs
router.get('/parsing-errors', getParsingErrors);

// Audit logs
router.get('/audit-logs', getAuditLogs);

// Prompt management
router.get('/prompts', getPrompts);
router.put('/prompts/:id', updatePrompt);

// Template management
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);

export default router;
