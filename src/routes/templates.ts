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

// Get template thumbnail (SVG placeholder or actual image)
router.get('/:templateId/thumbnail', async (req, res) => {
  try {
    const { templateId } = req.params;

    // Try to get template from database
    const { prisma } = await import('../utils/prisma');
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
      select: {
        name: true,
        templateConfig: true,
        previewImageUrl: true,
      },
    });

    if (!template) {
      return res.status(404).send('<svg><text>Not Found</text></svg>');
    }

    // If real thumbnail exists, redirect to it
    if (template.previewImageUrl && !template.previewImageUrl.startsWith('/api/')) {
      return res.redirect(template.previewImageUrl);
    }

    // Generate SVG placeholder based on actual template layout
    const config: any = template.templateConfig || {};
    const colorScheme = config.colorScheme || {};
    const primary = colorScheme.primary || '#2563eb';
    const bg = colorScheme.background || '#ffffff';
    const text = colorScheme.text || '#0f172a';
    const name = template.name || 'Template';
    const layout = config.layout || 'single-column';

    // Get design style for more distinct visuals
    const designStyle = config.designStyle || 'default';
    const components = config.components || {};

    // Generate style-specific SVG with dramatic differences
    let layoutSVG = '';

    // TRADITIONAL/FORMAL - Serif aesthetic, formal structure
    if (designStyle === 'traditional' || designStyle === 'executive' || designStyle === 'academic') {
      layoutSVG = `
        <rect x="50" y="30" width="300" height="2" fill="${primary}"/>
        <text x="200" y="60" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="${primary}" text-anchor="middle">NAME</text>
        <rect x="50" y="75" width="300" height="1" fill="${primary}" opacity="0.5"/>
        <text x="200" y="95" font-family="Georgia, serif" font-size="10" fill="${text}" opacity="0.7" text-anchor="middle">Professional Title</text>

        <text x="50" y="130" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="${primary}">EXPERIENCE</text>
        <rect x="50" y="135" width="80" height="1" fill="${primary}"/>
        <rect x="50" y="150" width="300" height="4" rx="1" fill="${text}" opacity="0.1"/>
        <rect x="50" y="160" width="280" height="4" rx="1" fill="${text}" opacity="0.1"/>
        <rect x="50" y="170" width="290" height="4" rx="1" fill="${text}" opacity="0.1"/>

        <text x="50" y="210" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="${primary}">EDUCATION</text>
        <rect x="50" y="215" width="70" height="1" fill="${primary}"/>
        <rect x="50" y="230" width="250" height="4" rx="1" fill="${text}" opacity="0.1"/>
        <rect x="50" y="240" width="220" height="4" rx="1" fill="${text}" opacity="0.1"/>`;
    }
    // MODERN/MINIMAL - Clean sans-serif, lots of space
    else if (designStyle === 'minimal' || designStyle === 'clean' || designStyle === 'contemporary') {
      layoutSVG = `
        <text x="200" y="50" font-family="Arial, sans-serif" font-size="32" font-weight="300" fill="${primary}" text-anchor="middle">Name</text>
        <text x="200" y="75" font-family="Arial, sans-serif" font-size="12" fill="${text}" opacity="0.6" text-anchor="middle">PROFESSIONAL ROLE</text>

        <rect x="100" y="120" width="200" height="3" rx="1.5" fill="${primary}" opacity="0.2"/>
        <text x="50" y="165" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="${primary}">Work Experience</text>
        <rect x="50" y="185" width="300" height="3" rx="1" fill="${text}" opacity="0.08"/>
        <rect x="50" y="195" width="280" height="3" rx="1" fill="${text}" opacity="0.08"/>
        <rect x="50" y="205" width="260" height="3" rx="1" fill="${text}" opacity="0.08"/>

        <text x="50" y="245" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="${primary}">Skills</text>
        <rect x="50" y="265" width="60" height="20" rx="10" fill="${primary}" opacity="0.15"/>
        <rect x="120" y="265" width="70" height="20" rx="10" fill="${primary}" opacity="0.15"/>
        <rect x="200" y="265" width="80" height="20" rx="10" fill="${primary}" opacity="0.15"/>`;
    }
    // CREATIVE/BOLD - Asymmetric, large headers, vibrant
    else if (designStyle === 'creative' || designStyle === 'bold' || designStyle === 'artistic') {
      layoutSVG = `
        <rect width="400" height="120" fill="${primary}"/>
        <text x="40" y="60" font-family="Impact, sans-serif" font-size="36" font-weight="bold" fill="${bg}">NAME</text>
        <text x="40" y="90" font-family="Arial, sans-serif" font-size="14" fill="${bg}" opacity="0.9">CREATIVE PROFESSIONAL</text>

        <rect x="30" y="140" width="8" height="80" fill="${primary}" opacity="0.8"/>
        <text x="50" y="160" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${primary}">Portfolio</text>
        <rect x="50" y="180" width="140" height="80" rx="4" fill="${primary}" opacity="0.1"/>
        <rect x="200" y="180" width="140" height="80" rx="4" fill="${primary}" opacity="0.1"/>

        <circle cx="330" cy="450" r="40" fill="${primary}" opacity="0.2"/>`;
    }
    // TECHNICAL/DEVELOPER - Monospace, code-like, structured
    else if (designStyle === 'developer' || designStyle === 'code' || designStyle === 'tech-stack') {
      layoutSVG = `
        <rect width="400" height="40" fill="${primary}" opacity="0.1"/>
        <text x="30" y="28" font-family="Courier New, monospace" font-size="18" fill="${primary}">$ cat resume.txt</text>

        <text x="30" y="70" font-family="Courier New, monospace" font-size="12" fill="${text}" opacity="0.8">&gt; NAME: John Developer</text>
        <text x="30" y="90" font-family="Courier New, monospace" font-size="12" fill="${text}" opacity="0.8">&gt; ROLE: Full Stack Engineer</text>

        <rect x="20" y="110" width="360" height="1" fill="${primary}" opacity="0.3"/>

        <text x="30" y="140" font-family="Courier New, monospace" font-size="14" fill="${primary}" font-weight="bold">EXPERIENCE {</text>
        <rect x="40" y="155" width="320" height="6" rx="1" fill="${text}" opacity="0.1"/>
        <rect x="40" y="168" width="300" height="6" rx="1" fill="${text}" opacity="0.1"/>
        <rect x="40" y="181" width="280" height="6" rx="1" fill="${text}" opacity="0.1"/>
        <text x="30" y="205" font-family="Courier New, monospace" font-size="14" fill="${primary}" font-weight="bold">}</text>

        <text x="30" y="235" font-family="Courier New, monospace" font-size="14" fill="${primary}" font-weight="bold">TECH_STACK: [</text>
        <rect x="40" y="250" width="50" height="18" rx="2" fill="${primary}" opacity="0.2"/>
        <rect x="100" y="250" width="60" height="18" rx="2" fill="${primary}" opacity="0.2"/>
        <rect x="170" y="250" width="55" height="18" rx="2" fill="${primary}" opacity="0.2"/>
        <text x="30" y="285" font-family="Courier New, monospace" font-size="14" fill="${primary}" font-weight="bold">]</text>`;
    }
    // TWO-COLUMN layouts for specific cases
    else if (layout === 'two-column-left') {
      layoutSVG = `
        <rect width="140" height="600" fill="${primary}" opacity="0.12"/>
        <circle cx="70" cy="50" r="30" fill="${primary}" opacity="0.7"/>
        <text x="70" y="100" font-family="Arial, sans-serif" font-size="11" fill="${primary}" font-weight="bold" text-anchor="middle">Name</text>
        <rect x="25" y="125" width="90" height="12" rx="2" fill="${primary}" opacity="0.4"/>
        <rect x="25" y="145" width="90" height="8" rx="2" fill="${text}" opacity="0.15"/>
        <rect x="25" y="160" width="90" height="8" rx="2" fill="${text}" opacity="0.15"/>

        <text x="170" y="50" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${primary}">Experience</text>
        <rect x="170" y="70" width="200" height="6" rx="1" fill="${text}" opacity="0.12"/>
        <rect x="170" y="82" width="190" height="6" rx="1" fill="${text}" opacity="0.12"/>
        <rect x="170" y="94" width="210" height="6" rx="1" fill="${text}" opacity="0.12"/>`;
    }
    // DEFAULT - standard professional
    else {
      layoutSVG = `
        <rect width="400" height="70" fill="${primary}" opacity="0.1"/>
        <text x="200" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${primary}" text-anchor="middle">NAME</text>

        <text x="50" y="110" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="${primary}">EXPERIENCE</text>
        <rect x="50" y="130" width="300" height="6" rx="1" fill="${text}" opacity="0.1"/>
        <rect x="50" y="142" width="280" height="6" rx="1" fill="${text}" opacity="0.1"/>
        <rect x="50" y="154" width="290" height="6" rx="1" fill="${text}" opacity="0.1"/>

        <text x="50" y="190" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="${primary}">EDUCATION</text>
        <rect x="50" y="210" width="250" height="6" rx="1" fill="${text}" opacity="0.1"/>`;
    }

    const svg = `<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="600" fill="${bg}"/>
  ${layoutSVG}
  <text x="200" y="580" font-family="Arial" font-size="10" fill="${text}" opacity="0.4" text-anchor="middle">${name.substring(0, 35)}</text>
</svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(svg);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    res.status(500).send('<svg><text>Error</text></svg>');
  }
});

// Get specific template details by ID
// NOTE: This route must come AFTER more specific routes like /:templateId/preview
// to avoid matching them incorrectly
router.get('/:templateId', getTemplateDetails);

export default router;
