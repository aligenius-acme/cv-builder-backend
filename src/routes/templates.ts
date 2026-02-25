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
router.post('/thumbnails/regenerate', async (_req, res) => {
  const { clearThumbnailCache, warmupThumbnails } = await import('../services/react-pdf-generator');
  clearThumbnailCache();
  warmupStarted = false;
  warmupThumbnails().catch(err => console.error('Thumbnail regeneration failed:', err));
  res.status(202).json({ message: 'Thumbnail regeneration started' });
});

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
router.get('/:templateId/thumbnail', async (req, res) => {
  try {
    const { templateId } = req.params;

    const { prisma } = await import('../utils/prisma');
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
      select: { previewImageUrl: true },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // If an external thumbnail URL exists, redirect to it
    if (template.previewImageUrl && !template.previewImageUrl.startsWith('/api/')) {
      return res.redirect(template.previewImageUrl);
    }

    // Generate screenshot using the same Puppeteer pipeline as PDF preview
    const { generateTemplateThumbnail, clearThumbnailCache } = await import('../services/react-pdf-generator');

    // Hard timeout: clear this template's cache entry on failure so the next
    // request retries from scratch rather than serving a broken cached promise.
    const TIMEOUT_MS = 60_000;
    const thumbnailBuffer = await Promise.race([
      generateTemplateThumbnail(templateId),
      new Promise<never>((_, reject) =>
        setTimeout(() => {
          clearThumbnailCache(templateId);
          reject(new Error(`Thumbnail generation timed out after ${TIMEOUT_MS}ms`));
        }, TIMEOUT_MS)
      ),
    ]);

    res.setHeader('Content-Type', 'image/jpeg');
    // Server-side in-memory cache is authoritative; tell browsers to always revalidate
    // so they pick up freshly-generated screenshots after server restarts
    res.setHeader('Cache-Control', 'no-cache');
    res.send(thumbnailBuffer);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`Thumbnail error for ${req.params.templateId}: ${msg}`);
    // Return a proper HTTP error so the frontend img tag shows its broken-image
    // state rather than a JSON body which produces a CORB-blocked response.
    res.status(500).end();
  }
});

// Get specific template details by ID
// NOTE: This route must come AFTER more specific routes like /:templateId/preview
// to avoid matching them incorrectly
router.get('/:templateId', getTemplateDetails);

export default router;
