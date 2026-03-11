import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getDashboard,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getAIUsage,
  getParsingErrors,
  getAuditLogs,
  getPrompts,
  updatePrompt,
  createTemplate,
  getTemplates,
  getAffiliates,
  createAffiliate,
  updateAffiliate,
  deleteAffiliate,
  getSettings,
  updateSetting,
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

// Affiliate link management
router.get('/affiliates', getAffiliates);
router.post('/affiliates', createAffiliate);
router.put('/affiliates/:id', updateAffiliate);
router.delete('/affiliates/:id', deleteAffiliate);

// App settings
router.get('/settings', getSettings);
router.put('/settings/:key', updateSetting);

export default router;
