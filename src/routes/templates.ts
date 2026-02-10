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

    // Generate SVG placeholder based on actual template configuration
    const config: any = template.templateConfig || {};
    const colorScheme = config.colorScheme || {};
    const primary = colorScheme.primary || '#2563eb';
    const secondary = colorScheme.secondary || '#64748b';
    const bg = colorScheme.background || '#ffffff';
    const text = colorScheme.text || '#0f172a';
    const muted = colorScheme.muted || '#64748b';
    const name = template.name || 'Template';
    const layout = config.layout || 'single-column';
    const components = config.components || {};

    // Get actual component types from config
    const headerType = components.header || 'minimal';
    const experienceType = components.experience || 'bullet-point';
    const skillsType = components.skills || 'compact-list';
    const hasSidebar = config.layout?.includes('two-column');

    // Generate component-specific SVG based on actual template config
    let layoutSVG = '';

    // Header styles
    let headerSVG = '';
    if (headerType === 'bold-modern' || headerType === 'gradient-background') {
      headerSVG = `
        <rect width="400" height="100" fill="${primary}" opacity="0.95"/>
        ${config.photoSupport ? `<circle cx="70" cy="50" r="35" fill="${bg}" opacity="0.9"/>` : ''}
        <text x="${config.photoSupport ? '120' : '200'}" y="45" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="${bg}" ${!config.photoSupport ? 'text-anchor="middle"' : ''}>SARAH JOHNSON</text>
        <text x="${config.photoSupport ? '120' : '200'}" y="70" font-family="Arial, sans-serif" font-size="11" fill="${bg}" opacity="0.85" ${!config.photoSupport ? 'text-anchor="middle"' : ''}>SOFTWARE ENGINEER</text>`;
    } else if (headerType === 'photo-prominent' || headerType === 'split-layout') {
      headerSVG = `
        ${config.photoSupport ? `
          <circle cx="200" cy="60" r="45" fill="${primary}" opacity="0.2"/>
          <circle cx="200" cy="60" r="38" fill="${primary}" opacity="0.4"/>
        ` : ''}
        <text x="200" y="${config.photoSupport ? '125' : '50'}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${primary}" text-anchor="middle">Sarah Johnson</text>
        <text x="200" y="${config.photoSupport ? '145' : '72'}" font-family="Arial, sans-serif" font-size="10" fill="${muted}" text-anchor="middle">SOFTWARE ENGINEER</text>`;
    } else if (headerType === 'professional-formal' || headerType === 'executive-signature') {
      headerSVG = `
        <text x="50" y="45" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="${primary}">Sarah Johnson</text>
        <rect x="50" y="52" width="120" height="2" fill="${primary}"/>
        <text x="50" y="75" font-family="Georgia, serif" font-size="11" fill="${muted}">SOFTWARE ENGINEER • San Francisco, CA</text>
        ${config.photoSupport ? `<circle cx="350" cy="50" r="32" fill="${primary}" opacity="0.15"/>` : ''}`;
    } else {
      // minimal, compact, two-column, etc.
      headerSVG = `
        ${config.photoSupport ? `<circle cx="60" cy="45" r="28" fill="${primary}" opacity="0.2"/>` : ''}
        <text x="${config.photoSupport ? '100' : '200'}" y="45" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="${primary}" ${!config.photoSupport ? 'text-anchor="middle"' : ''}>Sarah Johnson</text>
        <text x="${config.photoSupport ? '100' : '200'}" y="65" font-family="Arial, sans-serif" font-size="9" fill="${muted}" ${!config.photoSupport ? 'text-anchor="middle"' : ''}>sarah.johnson@email.com • (555) 987-6543</text>`;
    }

    // Experience styles
    let experienceSVG = '';
    const expY = headerType.includes('prominent') || headerType.includes('split') ? 165 : 95;

    if (experienceType === 'timeline-left' || experienceType === 'sidebar-dates') {
      experienceSVG = `
        <text x="50" y="${expY}" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="${primary}">EXPERIENCE</text>
        <rect x="58" y="${expY + 15}" width="2" height="90" fill="${primary}" opacity="0.4"/>
        <circle cx="59" cy="${expY + 20}" r="4" fill="${primary}"/>
        <text x="75" y="${expY + 23}" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="${text}">Senior Software Engineer</text>
        <text x="75" y="${expY + 36}" font-family="Arial, sans-serif" font-size="8" fill="${muted}">Tech Company • 2020-Present</text>
        <text x="85" y="${expY + 48}" font-family="Arial, sans-serif" font-size="7" fill="${text}">Built scalable microservices architecture</text>
        <text x="85" y="${expY + 58}" font-family="Arial, sans-serif" font-size="7" fill="${text}">Improved system performance by 40%</text>
        <circle cx="59" cy="${expY + 75}" r="4" fill="${primary}"/>
        <text x="75" y="${expY + 78}" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="${text}">Software Engineer</text>
        <text x="75" y="${expY + 91}" font-family="Arial, sans-serif" font-size="8" fill="${muted}">Previous Company • 2018-2020</text>`;
    } else if (experienceType === 'card-layout' || experienceType === 'grid-layout') {
      experienceSVG = `
        <text x="50" y="${expY}" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="${primary}">EXPERIENCE</text>
        <rect x="50" y="${expY + 15}" width="160" height="70" rx="4" fill="${primary}" opacity="0.08" stroke="${primary}" stroke-width="1.5" stroke-opacity="0.3"/>
        <text x="60" y="${expY + 32}" font-family="Arial, sans-serif" font-size="9" font-weight="600" fill="${text}">Senior Engineer</text>
        <text x="60" y="${expY + 44}" font-family="Arial, sans-serif" font-size="7" fill="${muted}">Tech Company</text>
        <text x="60" y="${expY + 54}" font-family="Arial, sans-serif" font-size="6" fill="${text}">Led cloud migration</text>
        <text x="60" y="${expY + 62}" font-family="Arial, sans-serif" font-size="6" fill="${text}">Reduced costs by 35%</text>
        <rect x="220" y="${expY + 15}" width="160" height="70" rx="4" fill="${primary}" opacity="0.08" stroke="${primary}" stroke-width="1.5" stroke-opacity="0.3"/>
        <text x="230" y="${expY + 32}" font-family="Arial, sans-serif" font-size="9" font-weight="600" fill="${text}">Engineer</text>
        <text x="230" y="${expY + 44}" font-family="Arial, sans-serif" font-size="7" fill="${muted}">Previous Co</text>
        <text x="230" y="${expY + 54}" font-family="Arial, sans-serif" font-size="6" fill="${text}">Built APIs</text>`;
    } else if (experienceType === 'metrics-focused' || experienceType === 'achievement-boxes') {
      experienceSVG = `
        <text x="50" y="${expY}" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="${primary}">EXPERIENCE</text>
        <text x="50" y="${expY + 23}" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="${text}">Senior Software Engineer</text>
        <text x="50" y="${expY + 36}" font-family="Arial, sans-serif" font-size="8" fill="${muted}">Tech Company • 2020-Present</text>
        <rect x="60" y="${expY + 46}" width="140" height="28" rx="3" fill="${primary}" opacity="0.12" stroke="${primary}" stroke-width="1" stroke-opacity="0.3"/>
        <text x="130" y="${expY + 58}" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${primary}" text-anchor="middle">40% Faster</text>
        <text x="130" y="${expY + 68}" font-family="Arial, sans-serif" font-size="6" fill="${text}" text-anchor="middle">Response Time</text>
        <rect x="210" y="${expY + 46}" width="140" height="28" rx="3" fill="${primary}" opacity="0.12" stroke="${primary}" stroke-width="1" stroke-opacity="0.3"/>
        <text x="280" y="${expY + 58}" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${primary}" text-anchor="middle">2M Users</text>
        <text x="280" y="${expY + 68}" font-family="Arial, sans-serif" font-size="6" fill="${text}" text-anchor="middle">Daily Active</text>`;
    } else {
      // bullet-point, compact-list, etc.
      experienceSVG = `
        <text x="50" y="${expY}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${primary}">EXPERIENCE</text>
        <text x="50" y="${expY + 20}" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="${text}">Senior Software Engineer</text>
        <text x="50" y="${expY + 32}" font-family="Arial, sans-serif" font-size="8" fill="${muted}">Tech Company • San Francisco • 2020-Present</text>
        <circle cx="58" cy="${expY + 45}" r="2" fill="${primary}"/>
        <text x="65" y="${expY + 48}" font-family="Arial, sans-serif" font-size="8" fill="${text}">Led microservices architecture serving 2M+ users</text>
        <circle cx="58" cy="${expY + 58}" r="2" fill="${primary}"/>
        <text x="65" y="${expY + 61}" font-family="Arial, sans-serif" font-size="8" fill="${text}">Reduced API response times by 40%</text>

        <text x="50" y="${expY + 80}" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="${text}">Software Engineer</text>
        <text x="50" y="${expY + 92}" font-family="Arial, sans-serif" font-size="8" fill="${muted}">Previous Company • New York • 2018-2020</text>
        <circle cx="58" cy="${expY + 105}" r="2" fill="${primary}"/>
        <text x="65" y="${expY + 108}" font-family="Arial, sans-serif" font-size="8" fill="${text}">Built scalable REST APIs with Node.js</text>
        <circle cx="58" cy="${expY + 118}" r="2" fill="${primary}"/>
        <text x="65" y="${expY + 121}" font-family="Arial, sans-serif" font-size="8" fill="${text}">Improved database performance by 35%</text>`;
    }

    // Skills styles
    let skillsSVG = '';
    const skillsY = expY + 105;

    if (skillsType === 'progress-bars' || skillsType === 'rated') {
      skillsSVG = `
        <text x="50" y="${skillsY}" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="${primary}">SKILLS</text>
        <text x="50" y="${skillsY + 18}" font-family="Arial, sans-serif" font-size="8" fill="${text}">JavaScript</text>
        <rect x="120" y="${skillsY + 12}" width="230" height="8" rx="4" fill="${primary}" opacity="0.15"/>
        <rect x="120" y="${skillsY + 12}" width="190" height="8" rx="4" fill="${primary}" opacity="0.7"/>
        <text x="50" y="${skillsY + 33}" font-family="Arial, sans-serif" font-size="8" fill="${text}">React</text>
        <rect x="120" y="${skillsY + 27}" width="230" height="8" rx="4" fill="${primary}" opacity="0.15"/>
        <rect x="120" y="${skillsY + 27}" width="170" height="8" rx="4" fill="${primary}" opacity="0.7"/>`;
    } else if (skillsType === 'pill' || skillsType === 'chip' || skillsType === 'icon') {
      skillsSVG = `
        <text x="50" y="${skillsY}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${primary}">SKILLS</text>
        <rect x="50" y="${skillsY + 15}" width="65" height="20" rx="10" fill="${primary}" opacity="0.2" stroke="${primary}" stroke-width="1" stroke-opacity="0.5"/>
        <text x="82" y="${skillsY + 29}" font-family="Arial, sans-serif" font-size="9" fill="${text}" text-anchor="middle" font-weight="600">JavaScript</text>
        <rect x="125" y="${skillsY + 15}" width="75" height="20" rx="10" fill="${primary}" opacity="0.2" stroke="${primary}" stroke-width="1" stroke-opacity="0.5"/>
        <text x="162" y="${skillsY + 29}" font-family="Arial, sans-serif" font-size="9" fill="${text}" text-anchor="middle" font-weight="600">TypeScript</text>
        <rect x="210" y="${skillsY + 15}" width="50" height="20" rx="10" fill="${primary}" opacity="0.2" stroke="${primary}" stroke-width="1" stroke-opacity="0.5"/>
        <text x="235" y="${skillsY + 29}" font-family="Arial, sans-serif" font-size="9" fill="${text}" text-anchor="middle" font-weight="600">React</text>
        <rect x="270" y="${skillsY + 15}" width="70" height="20" rx="10" fill="${primary}" opacity="0.2" stroke="${primary}" stroke-width="1" stroke-opacity="0.5"/>
        <text x="305" y="${skillsY + 29}" font-family="Arial, sans-serif" font-size="9" fill="${text}" text-anchor="middle" font-weight="600">Node.js</text>
        <rect x="50" y="${skillsY + 42}" width="55" height="20" rx="10" fill="${primary}" opacity="0.2" stroke="${primary}" stroke-width="1" stroke-opacity="0.5"/>
        <text x="77" y="${skillsY + 56}" font-family="Arial, sans-serif" font-size="9" fill="${text}" text-anchor="middle" font-weight="600">Python</text>
        <rect x="115" y="${skillsY + 42}" width="45" height="20" rx="10" fill="${primary}" opacity="0.2" stroke="${primary}" stroke-width="1" stroke-opacity="0.5"/>
        <text x="137" y="${skillsY + 56}" font-family="Arial, sans-serif" font-size="9" fill="${text}" text-anchor="middle" font-weight="600">AWS</text>`;
    } else if (skillsType === 'table-grid' || skillsType === 'categorized') {
      skillsSVG = `
        <text x="50" y="${skillsY}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${primary}">SKILLS</text>
        <rect x="50" y="${skillsY + 12}" width="95" height="20" rx="2" fill="${primary}" opacity="0.08" stroke="${primary}" stroke-width="1" stroke-opacity="0.2"/>
        <text x="97" y="${skillsY + 26}" font-family="Arial, sans-serif" font-size="9" fill="${text}" text-anchor="middle" font-weight="600">JavaScript</text>
        <rect x="150" y="${skillsY + 12}" width="95" height="20" rx="2" fill="${primary}" opacity="0.08" stroke="${primary}" stroke-width="1" stroke-opacity="0.2"/>
        <text x="197" y="${skillsY + 26}" font-family="Arial, sans-serif" font-size="9" fill="${text}" text-anchor="middle" font-weight="600">TypeScript</text>
        <rect x="250" y="${skillsY + 12}" width="95" height="20" rx="2" fill="${primary}" opacity="0.08" stroke="${primary}" stroke-width="1" stroke-opacity="0.2"/>
        <text x="297" y="${skillsY + 26}" font-family="Arial, sans-serif" font-size="9" fill="${text}" text-anchor="middle" font-weight="600">React</text>
        <rect x="50" y="${skillsY + 37}" width="95" height="20" rx="2" fill="${primary}" opacity="0.08" stroke="${primary}" stroke-width="1" stroke-opacity="0.2"/>
        <text x="97" y="${skillsY + 51}" font-family="Arial, sans-serif" font-size="9" fill="${text}" text-anchor="middle" font-weight="600">Node.js</text>
        <rect x="150" y="${skillsY + 37}" width="95" height="20" rx="2" fill="${primary}" opacity="0.08" stroke="${primary}" stroke-width="1" stroke-opacity="0.2"/>
        <text x="197" y="${skillsY + 51}" font-family="Arial, sans-serif" font-size="9" fill="${text}" text-anchor="middle" font-weight="600">Python</text>
        <rect x="250" y="${skillsY + 37}" width="95" height="20" rx="2" fill="${primary}" opacity="0.08" stroke="${primary}" stroke-width="1" stroke-opacity="0.2"/>
        <text x="297" y="${skillsY + 51}" font-family="Arial, sans-serif" font-size="9" fill="${text}" text-anchor="middle" font-weight="600">AWS</text>`;
    } else {
      // compact-list
      skillsSVG = `
        <text x="50" y="${skillsY}" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="${primary}">SKILLS</text>
        <text x="50" y="${skillsY + 20}" font-family="Arial, sans-serif" font-size="9" fill="${text}">JavaScript • TypeScript • React • Node.js • Python • AWS • Docker</text>`;
    }

    // Education section
    let educationSVG = '';
    const eduY = skillsY + 70;
    educationSVG = `
      <text x="50" y="${eduY}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${primary}">EDUCATION</text>
      <text x="50" y="${eduY + 18}" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="${text}">B.S. Computer Science</text>
      <text x="50" y="${eduY + 30}" font-family="Arial, sans-serif" font-size="8" fill="${muted}">Stanford University • 2014-2018 • GPA: 3.8</text>`;

    // Projects section
    let projectsSVG = '';
    const projectsY = eduY + 48;
    projectsSVG = `
      <text x="50" y="${projectsY}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${primary}">PROJECTS</text>
      <text x="50" y="${projectsY + 18}" font-family="Arial, sans-serif" font-size="9" font-weight="600" fill="${text}">E-Commerce Platform</text>
      <text x="50" y="${projectsY + 29}" font-family="Arial, sans-serif" font-size="8" fill="${text}">Built full-stack application with React, Node.js, PostgreSQL</text>
      <text x="50" y="${projectsY + 39}" font-family="Arial, sans-serif" font-size="8" fill="${text}">Deployed to AWS with CI/CD, serving 50K+ monthly users</text>`;

    // Certifications section
    let certsSVG = '';
    const certsY = projectsY + 58;
    certsSVG = `
      <text x="50" y="${certsY}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${primary}">CERTIFICATIONS</text>
      <circle cx="55" cy="${certsY + 13}" r="2" fill="${primary}"/>
      <text x="62" y="${certsY + 16}" font-family="Arial, sans-serif" font-size="8" fill="${text}">AWS Certified Solutions Architect • 2023</text>
      <circle cx="55" cy="${certsY + 26}" r="2" fill="${primary}"/>
      <text x="62" y="${certsY + 29}" font-family="Arial, sans-serif" font-size="8" fill="${text}">Google Cloud Professional • 2022</text>`;

    // Languages section
    let languagesSVG = '';
    const langY = certsY + 48;
    languagesSVG = `
      <text x="50" y="${langY}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${primary}">LANGUAGES</text>
      <text x="50" y="${langY + 16}" font-family="Arial, sans-serif" font-size="8" fill="${text}">English (Native) • Spanish (Fluent) • French (Basic)</text>`;

    // Combine as extraSVG
    let extraSVG = projectsSVG + certsSVG + languagesSVG;

    // Sidebar for two-column layouts
    let sidebarSVG = '';
    if (hasSidebar) {
      sidebarSVG = `
        <rect width="130" height="600" fill="${primary}" opacity="0.12"/>
        ${config.photoSupport ? `<circle cx="65" cy="40" r="30" fill="${primary}" opacity="0.5"/>` : ''}
        <text x="65" y="${config.photoSupport ? '85' : '50'}" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="${primary}" text-anchor="middle">CONTACT</text>
        <rect x="20" y="${config.photoSupport ? '95' : '60'}" width="90" height="6" rx="2" fill="${primary}" opacity="0.3"/>
        <rect x="20" y="${config.photoSupport ? '107' : '72'}" width="80" height="6" rx="2" fill="${text}" opacity="0.15"/>
        <text x="65" y="${config.photoSupport ? '130' : '95'}" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="${primary}" text-anchor="middle">SKILLS</text>
        <text x="65" y="${config.photoSupport ? '150' : '115'}" font-family="Arial, sans-serif" font-size="7" fill="${text}" text-anchor="middle">JavaScript</text>
        <text x="65" y="${config.photoSupport ? '162' : '127'}" font-family="Arial, sans-serif" font-size="7" fill="${text}" text-anchor="middle">React</text>
        <text x="65" y="${config.photoSupport ? '174' : '139'}" font-family="Arial, sans-serif" font-size="7" fill="${text}" text-anchor="middle">Node.js</text>`;
    }

    // Combine all sections - ALWAYS show all 5 sections
    if (hasSidebar) {
      layoutSVG = `
        ${sidebarSVG}
        <g transform="translate(140, 0)">
          ${headerSVG}
          ${experienceSVG}
          ${skillsSVG}
          ${educationSVG}
          ${extraSVG}
        </g>`;
    } else {
      layoutSVG = `
        ${headerSVG}
        ${experienceSVG}
        ${skillsSVG}
        ${educationSVG}
        ${extraSVG}`;
    }


    const svg = `<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="600" fill="${bg}"/>
  ${layoutSVG}
  <text x="200" y="580" font-family="Arial" font-size="10" fill="${text}" opacity="0.4" text-anchor="middle">${name.substring(0, 35)}</text>
</svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // Force fresh content
    res.setHeader('Pragma', 'no-cache'); // HTTP 1.0 compatibility
    res.setHeader('Expires', '0'); // Proxies
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
