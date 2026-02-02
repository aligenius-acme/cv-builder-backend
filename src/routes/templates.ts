import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTemplates,
  getTemplateDetails,
  getTemplatesByCategory,
  getFilterOptions,
  getRecommendedTemplates,
  getTemplateStats,
  previewTemplate,
} from '../controllers/templates';

const router = Router();

// Public routes (no authentication required for browsing templates)
// Get all available templates with optional filtering
// Query params: category, designStyle, atsCompatibility, pageLength, experienceLevel,
//               industryTags[], targetRoles[], isPremium, isFeatured, search, limit, offset
router.get('/', getTemplates);

// Get available filter options (categories, styles, industries, etc.)
router.get('/filters', getFilterOptions);

// Get templates by category
router.get('/category/:category', getTemplatesByCategory);

// Protected routes (authentication required)
// Get recommended templates based on user data
// Query params: resumeId (optional), limit (optional)
router.post('/recommended', authenticate, getRecommendedTemplates);

// Get template statistics
router.get('/stats', authenticate, getTemplateStats);

// Preview a template with sample or user data
router.get('/:templateId/preview', authenticate, previewTemplate);

// Get specific template details by ID
// NOTE: This route must come AFTER more specific routes like /:templateId/preview
// to avoid matching them incorrectly
router.get('/:templateId', getTemplateDetails);

export default router;
