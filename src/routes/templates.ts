import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getTemplates, previewTemplate } from '../controllers/templates';

const router = Router();

// Get all available templates
router.get('/', authenticate, getTemplates);

// Preview a template with sample or user data
router.get('/:templateId/preview', authenticate, previewTemplate);

export default router;
