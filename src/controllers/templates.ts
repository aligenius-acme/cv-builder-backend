import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, ParsedResumeData } from '../types';
import { getAllTemplates, getTemplate, isValidTemplate } from '../services/templates';
import { generatePDF } from '../services/documents';
import { generateTemplateHTML } from '../services/template-html-generator';
import { prisma } from '../utils/prisma';
import { NotFoundError, ValidationError } from '../utils/errors';
import * as TemplateRegistry from '../services/template-registry';

// Get all available templates
export const getTemplates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract query parameters for filtering
    const {
      category,
      designStyle,
      atsCompatibility,
      pageLength,
      experienceLevel,
      industryTags,
      targetRoles,
      isPremium,
      isFeatured,
      search,
      limit,
      offset,
    } = req.query;

    // Build filters
    const filters: TemplateRegistry.TemplateFilters = {
      primaryCategory: category as string,
      designStyle: designStyle as string,
      atsCompatibility: atsCompatibility as string,
      pageLength: pageLength as string,
      experienceLevel: experienceLevel as string,
      industryTags: industryTags ? (Array.isArray(industryTags) ? industryTags as string[] : [industryTags as string]) : undefined,
      targetRoles: targetRoles ? (Array.isArray(targetRoles) ? targetRoles as string[] : [targetRoles as string]) : undefined,
      isPremium: isPremium === 'true' ? true : isPremium === 'false' ? false : undefined,
      isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
      searchQuery: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    };

    const templates = await TemplateRegistry.getAllTemplates(filters);

    res.json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};

// Get template by ID
export const getTemplateDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { templateId } = req.params;

    const template = await TemplateRegistry.getTemplateById(templateId);

    if (!template) {
      throw new NotFoundError(`Template not found: ${templateId}`);
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

// Get templates by category
export const getTemplatesByCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category } = req.params;

    const templates = await TemplateRegistry.getTemplatesByCategory(category);

    res.json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};

// Get filter options
export const getFilterOptions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const options = await TemplateRegistry.getFilterOptions();

    res.json({
      success: true,
      data: options,
    });
  } catch (error) {
    next(error);
  }
};

// Get recommended templates
export const getRecommendedTemplates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { resumeId, limit, industry, experienceLevel, skills } = req.body;

    let resumeData: ParsedResumeData | undefined;

    // If resume ID provided, load user's resume data for personalization
    if (resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId as string, userId },
      });

      if (resume) {
        resumeData = resume.parsedData as unknown as ParsedResumeData;
      }
    } else if (industry || experienceLevel || skills) {
      // Use provided data for recommendations
      resumeData = {
        contact: { name: '', email: '', phone: '', location: '' },
        summary: '',
        experience: [],
        education: [],
        skills: skills || [],
      } as ParsedResumeData;
    }

    const templates = await TemplateRegistry.getRecommendedTemplates(
      resumeData,
      limit || 5
    );

    res.json({
      success: true,
      count: templates.length,
      data: { templates },
    });
  } catch (error) {
    next(error);
  }
};

// Get template statistics
export const getTemplateStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await TemplateRegistry.getTemplateStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// Preview template with sample data or user's resume data
// Legacy PDF preview — replaced by GET /:templateId/render which returns HTML.
export const previewTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const { templateId } = req.params;
  const qs = new URLSearchParams(req.query as Record<string, string>).toString();
  res.redirect(301, `/api/templates/${templateId}/render${qs ? '?' + qs : ''}`);
};

/**
 * GET /:templateId/thumbnail
 * Serve a template thumbnail image.
 * - Fast path: redirect to Cloudinary URL if one is stored in the DB.
 * - Fallback: return an SVG placeholder (Puppeteer-based generation removed).
 */
export const getThumbnail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { templateId } = req.params;

    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
      select: { previewImageUrl: true, name: true },
    });

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Fast path: redirect to stored Cloudinary URL
    if (template.previewImageUrl && !template.previewImageUrl.startsWith('/api/')) {
      res.redirect(template.previewImageUrl);
      return;
    }

    // Fallback: serve an SVG placeholder with the template name
    const name = (template.name || templateId).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] ?? c));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="210" height="297" viewBox="0 0 210 297">
  <rect width="210" height="297" fill="#f8fafc"/>
  <rect x="16" y="16" width="178" height="40" rx="4" fill="#1e3a8a"/>
  <rect x="16" y="72" width="120" height="8" rx="2" fill="#cbd5e1"/>
  <rect x="16" y="88" width="90" height="6" rx="2" fill="#e2e8f0"/>
  <rect x="16" y="112" width="178" height="1" fill="#e2e8f0"/>
  <rect x="16" y="124" width="60" height="6" rx="2" fill="#1e3a8a" opacity="0.6"/>
  <rect x="16" y="138" width="178" height="5" rx="2" fill="#e2e8f0"/>
  <rect x="16" y="150" width="150" height="5" rx="2" fill="#e2e8f0"/>
  <rect x="16" y="162" width="165" height="5" rx="2" fill="#e2e8f0"/>
  <rect x="16" y="186" width="60" height="6" rx="2" fill="#1e3a8a" opacity="0.6"/>
  <rect x="16" y="200" width="178" height="5" rx="2" fill="#e2e8f0"/>
  <rect x="16" y="212" width="140" height="5" rx="2" fill="#e2e8f0"/>
  <text x="105" y="42" font-family="sans-serif" font-size="11" fill="white" text-anchor="middle" dominant-baseline="middle">${name}</text>
</svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(svg);
  } catch (error) {
    res.status(500).end();
  }
};

/**
 * POST /thumbnails/regenerate — stub (Puppeteer removed).
 * Thumbnails are now served from Cloudinary or as SVG placeholders.
 */
export const regenerateThumbnails = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: 'Thumbnail regeneration is not available (Puppeteer removed). Upload thumbnails to Cloudinary directly.' });
};

/**
 * Render a template as HTML — used by the frontend for live preview (iframe srcdoc)
 * and client-side PDF generation via browser print. No Puppeteer involved.
 * Accepts optional resumeId/versionId to use real user data; falls back to sample data.
 */
export const renderTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { templateId } = req.params;
    const { resumeId, versionId } = req.query;
    const userId = req.user!.id;

    const template = await TemplateRegistry.getTemplateById(templateId);
    if (!template) throw new ValidationError(`Invalid template: ${templateId}`);

    let resumeData: ParsedResumeData;

    if (versionId && resumeId) {
      const version = await prisma.resumeVersion.findFirst({
        where: { id: versionId as string, resumeId: resumeId as string, userId },
        include: { resume: true },
      });
      if (!version) throw new NotFoundError('Version not found');
      resumeData = version.tailoredData as unknown as ParsedResumeData;
      if (!resumeData.contact || typeof resumeData.contact !== 'object') resumeData.contact = {};
      const photo = version.resume.photoUrl || resumeData.photoUrl;
      if (photo) { resumeData.contact.photoUrl = photo; resumeData.photoUrl = photo; }
    } else if (resumeId) {
      const resume = await prisma.resume.findFirst({ where: { id: resumeId as string, userId } });
      if (!resume) throw new NotFoundError('Resume not found');
      resumeData = resume.parsedData as unknown as ParsedResumeData;
      if (!resumeData.contact || typeof resumeData.contact !== 'object') resumeData.contact = {};
      const photo = resume.photoUrl || resumeData.photoUrl;
      if (photo) { resumeData.contact.photoUrl = photo; resumeData.photoUrl = photo; }
    } else {
      resumeData = getSampleResumeData();
    }

    const { generateResumeHTML } = await import('../services/react-pdf-generator');
    const html = await generateResumeHTML(templateId, resumeData);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'private, no-cache');
    res.send(html);
  } catch (error) {
    next(error);
  }
};

// Sample data for template preview
export function getSampleResumeData(): ParsedResumeData {
  return {
    contact: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 987-6543',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/sarahjohnson',
      github: 'github.com/sarahjohnson',
      website: 'sarahjohnson.dev',
      photoUrl: 'https://ui-avatars.com/api/?name=Sarah+Johnson&size=300&background=3b82f6&color=fff&bold=true',
    },
    summary: 'Results-driven Software Engineer with 8+ years of experience in full-stack development, cloud architecture, and agile team leadership. Proven expertise in building scalable applications serving millions of users. Passionate about mentoring junior developers and implementing best practices for code quality and system reliability.',
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Innovations Inc.',
        location: 'San Francisco, CA',
        startDate: 'Jan 2020',
        endDate: '',
        current: true,
        description: [
          'Led development of microservices architecture serving 2.5M+ daily active users, improving system reliability to 99.95% uptime',
          'Reduced API response times by 40% through database query optimization and implementing Redis caching strategy',
          'Mentored team of 5 junior developers, conducting code reviews and improving code quality metrics by 35%',
          'Architected and deployed containerized applications using Docker and Kubernetes on AWS EKS',
          'Implemented comprehensive monitoring and alerting system using Datadog, reducing incident response time by 50%',
        ],
      },
      {
        title: 'Software Engineer',
        company: 'Startup Labs',
        location: 'San Jose, CA',
        startDate: 'Jun 2017',
        endDate: 'Dec 2019',
        current: false,
        description: [
          'Built real-time analytics dashboard using React, TypeScript, and Node.js, processing 100K+ events per minute',
          'Implemented CI/CD pipelines with GitHub Actions and AWS CodeDeploy, reducing deployment time from 2 hours to 15 minutes',
          'Developed RESTful APIs and GraphQL endpoints serving web and mobile applications',
          'Collaborated with product team to define technical requirements and deliver features on aggressive timelines',
          'Reduced production bugs by 60% through comprehensive unit and integration testing',
        ],
      },
      {
        title: 'Junior Software Developer',
        company: 'Digital Solutions Co.',
        location: 'Palo Alto, CA',
        startDate: 'Aug 2015',
        endDate: 'May 2017',
        current: false,
        description: [
          'Developed responsive web applications using React, Redux, and Material-UI',
          'Participated in agile development process including daily standups, sprint planning, and retrospectives',
          'Fixed bugs and implemented new features based on user feedback and requirements',
        ],
      },
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of California, Berkeley',
        graduationDate: 'May 2015',
        gpa: '3.8',
        achievements: [
          'Dean\'s Honor List (4 semesters)',
          'President of Computer Science Student Association',
          'First place in UC Berkeley Hackathon 2014',
        ],
      },
    ],
    skills: [
      'JavaScript',
      'TypeScript',
      'React',
      'Node.js',
      'Python',
      'AWS',
      'Docker',
      'Kubernetes',
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'GraphQL',
      'Git',
      'CI/CD',
      'Microservices',
    ],
    certifications: [
      { name: 'AWS Solutions Architect - Professional', date: 'Dec 2022', issuer: 'Amazon Web Services' },
      { name: 'Google Cloud Professional Developer', date: 'Aug 2021', issuer: 'Google Cloud' },
      { name: 'Certified Kubernetes Administrator (CKA)', date: 'Mar 2023', issuer: 'Cloud Native Computing Foundation' },
    ],
    projects: [
      {
        name: 'Open Source Analytics Platform',
        description: [
          'Built a comprehensive analytics platform with real-time data processing, custom dashboards, and alerting',
          'Featured on Product Hunt and gained 1,200+ GitHub stars within 3 months of launch',
          'Optimized query performance by 60% through indexing strategies and caching layers',
        ],
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Redis'],
        url: 'github.com/analytics-platform',
      },
      {
        name: 'Machine Learning Model Deployment Tool',
        description: [
          'Created a CLI tool for streamlining ML model deployment to cloud platforms',
          'Reduced deployment time by 70% through automated containerization and CI/CD pipelines',
          'Supports AWS SageMaker, Google Vertex AI, and Azure ML with a unified interface',
        ],
        technologies: ['Python', 'TensorFlow', 'AWS SageMaker', 'Docker'],
      },
    ],
    languages: [
      'English (Native)',
      'Spanish (Fluent)',
      'Mandarin (Conversational)',
    ],
    awards: [
      'AWS Partner of the Year 2023',
      'Top Contributor Award - Open Source Community',
      'Best Technical Innovation - Tech Innovations Inc.',
      'UC Berkeley Hackathon Winner 2014',
    ],
    volunteerWork: [
      {
        role: 'Coding Mentor',
        organization: 'Code for Good',
        location: 'San Francisco, CA',
        startDate: 'Jan 2021',
        endDate: '',
        current: true,
        description: [
          'Mentored 20+ students in web development fundamentals including HTML, CSS, JavaScript, and React',
          'Organized monthly coding workshops for underrepresented communities, reaching 100+ participants',
          'Developed curriculum for beginner-friendly web development bootcamp',
        ],
      },
      {
        role: 'Technology Consultant',
        organization: 'Local Non-Profit Alliance',
        location: 'San Francisco, CA',
        startDate: 'Jun 2019',
        endDate: 'Dec 2020',
        current: false,
        description: [
          'Provided pro-bono technical consulting to 5 local non-profit organizations',
          'Built custom web applications to help organizations streamline operations and increase donor engagement',
        ],
      },
    ],
  };
}
