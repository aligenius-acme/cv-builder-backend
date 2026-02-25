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
  getThumbnail,
  regenerateThumbnails,
} from '../controllers/templates';

const router = Router();

// Kick off thumbnail pre-generation in the background as soon as the server starts
// serving template requests. Thumbnails are cached in-memory, so the first request
// triggers generation and every subsequent request is served instantly from cache.
let warmupStarted = false;
function maybeWarmup() {
  if (warmupStarted) return;
  warmupStarted = true;
  // fire-and-forget — don't await, don't block the response
  import('../services/react-pdf-generator')
    .then(({ warmupThumbnails }) => warmupThumbnails())
    .catch(err => console.error('Thumbnail warmup failed:', err));
}

// Public routes (no authentication required for browsing templates)
// Get all available templates with optional filtering
// Query params: category, designStyle, atsCompatibility, pageLength, experienceLevel,
//               industryTags[], targetRoles[], isPremium, isFeatured, search, limit, offset
router.get('/', (req, res, next) => { maybeWarmup(); next(); }, getTemplates);

// Get available filter options (categories, styles, industries, etc.)
router.get('/filters', getFilterOptions);

// Force-clear the in-memory thumbnail cache and re-warm all thumbnails.
// Fire-and-forget: returns 202 immediately; generation runs in background.
router.post('/thumbnails/regenerate', regenerateThumbnails);

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

// Get template thumbnail — Puppeteer screenshot matching exact PDF output
router.get('/:templateId/thumbnail', getThumbnail);

// Get specific template details by ID
// NOTE: This route must come AFTER more specific routes like /:templateId/preview
// to avoid matching them incorrectly
router.get('/:templateId', getTemplateDetails);

export default router;
