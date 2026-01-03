import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ParsedResumeData } from '../types';
import { getAllTemplates, getTemplate, isValidTemplate } from '../services/templates';
import { generatePDF } from '../services/documents';
import { prisma } from '../utils/prisma';
import { NotFoundError, ValidationError } from '../utils/errors';

// Get all available templates
export const getTemplates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const templates = getAllTemplates();
    res.json({
      success: true,
      data: templates,
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

    if (!isValidTemplate(templateId)) {
      throw new ValidationError(`Invalid template: ${templateId}`);
    }

    const template = getTemplate(templateId);
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

    // Generate PDF preview
    const buffer = await generatePDF(resumeData, template);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="preview-${templateId}.pdf"`);
    res.send(buffer);
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
      'AWS Solutions Architect - Professional',
      'Google Cloud Professional Developer',
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
