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

      // Add photo from resume if available
      if (resume.photoUrl && !resumeData.contact.photoUrl) {
        resumeData.contact.photoUrl = resume.photoUrl;
      }
    } else {
      // Use sample data for preview
      resumeData = getSampleResumeData();
    }

    // Generate PDF preview using React components (modular system)
    const { generatePDFFromReact } = await import('../services/react-pdf-generator');
    const pdfBuffer = await generatePDFFromReact(templateId, resumeData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(pdfBuffer);
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
        description: 'Built a comprehensive open-source analytics platform with real-time data processing, custom dashboards, and alerting. Featured on Product Hunt and gained 1,200+ GitHub stars.',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Redis'],
        url: 'github.com/analytics-platform',
      },
      {
        name: 'Machine Learning Model Deployment Tool',
        description: 'Created a CLI tool for streamlining ML model deployment to cloud platforms, reducing deployment time by 70%.',
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
