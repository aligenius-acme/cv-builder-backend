import { Response, NextFunction } from 'express';
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
export const previewTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { templateId } = req.params;
    const { resumeId, versionId } = req.query;
    const userId = req.user!.id;

    // Validate template exists in database registry
    const template = await TemplateRegistry.getTemplateById(templateId);
    if (!template) {
      throw new ValidationError(`Invalid template: ${templateId}`);
    }

    let resumeData: ParsedResumeData;

    if (versionId && resumeId) {
      // Use user's actual version data
      const version = await prisma.resumeVersion.findFirst({
        where: { id: versionId as string, resumeId: resumeId as string, userId },
      });

      if (!version) {
        throw new NotFoundError('Version not found');
      }

      resumeData = version.tailoredData as unknown as ParsedResumeData;
    } else if (resumeId) {
      // Use user's original resume data
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId as string, userId },
      });

      if (!resume) {
        throw new NotFoundError('Resume not found');
      }

      resumeData = resume.parsedData as unknown as ParsedResumeData;
    } else {
      // Use sample data for preview
      resumeData = getSampleResumeData();
    }

    // Generate HTML preview for iframe rendering
    const html = await generateTemplateHTML(templateId, resumeData);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(html);
  } catch (error) {
    next(error);
  }
};

// Sample data for template preview
function getSampleResumeData(): ParsedResumeData {
  return {
    contact: {
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/johnsmith',
    },
    summary: 'Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and mentoring junior developers.',
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Company Inc.',
        location: 'San Francisco, CA',
        startDate: 'Jan 2020',
        endDate: '',
        current: true,
        description: [
          'Led development of microservices architecture serving 2M+ daily active users',
          'Reduced API response times by 40% through database optimization',
          'Mentored team of 5 junior developers, improving code quality by 25%',
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
          'Built real-time analytics dashboard using React and Node.js',
          'Implemented CI/CD pipelines reducing deployment time by 60%',
          'Collaborated with product team to define technical requirements',
        ],
      },
    ],
    education: [
      {
        degree: 'B.S. Computer Science',
        institution: 'University of California, Berkeley',
        graduationDate: 'May 2017',
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
      'PostgreSQL',
      'MongoDB',
      'GraphQL',
    ],
    certifications: [
      { name: 'AWS Solutions Architect - Professional' },
      { name: 'Google Cloud Professional Developer' },
    ],
    projects: [
      {
        name: 'Open Source Analytics Platform',
        description: 'Built an open-source analytics platform with 500+ GitHub stars',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
      },
    ],
  };
}
