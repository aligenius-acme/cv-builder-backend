"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const admin_1 = require("../controllers/admin");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(auth_1.authenticate);
router.use(auth_1.requireAdmin);
// Dashboard
router.get('/dashboard', admin_1.getDashboard);
// Users management
router.get('/users', admin_1.getUsers);
router.get('/users/:id', admin_1.getUser);
router.put('/users/:id', admin_1.updateUser);
router.delete('/users/:id', admin_1.deleteUser);
// Organizations management
router.get('/organizations', admin_1.getOrganizations);
// AI Usage monitoring
router.get('/ai-usage', admin_1.getAIUsage);
// Error logs
router.get('/parsing-errors', admin_1.getParsingErrors);
// Audit logs
router.get('/audit-logs', admin_1.getAuditLogs);
// Prompt management
router.get('/prompts', admin_1.getPrompts);
router.put('/prompts/:id', admin_1.updatePrompt);
// Template management
router.get('/templates', admin_1.getTemplates);
router.post('/templates', admin_1.createTemplate);
exports.default = router;
//# sourceMappingURL=admin.js.map