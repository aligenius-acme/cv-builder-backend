import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { callAIRaw } from '../services/ai';
import { config } from '../config';
import { prisma } from '../utils/prisma';
import * as adzunaService from '../services/adzunaService';

export const searchJobs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      keywords,
      location,
      experienceLevel,
      jobType,
      salary,
      remote,
      postedWithin,
      page = 1,
      limit = 20,
      sortBy,
    } = req.query;

    if (!keywords) {
      return res.status(400).json({
        success: false,
        error: 'Keywords are required',
      });
    }

    // Check if Adzuna is configured
    if (!adzunaService.isAdzunaConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Job search service not configured. Please add Adzuna API credentials.',
      });
    }

    // Build search parameters
    const searchParams: adzunaService.SearchJobsParams = {
      keywords: keywords as string,
      location: (location as string) || undefined,
      page: Number(page),
      resultsPerPage: Number(limit),
      sortBy: sortBy as 'relevance' | 'date' | 'salary' | undefined,
    };

    // Add job type filters
    if (jobType === 'full-time') {
      searchParams.fullTime = true;
    } else if (jobType === 'part-time') {
      searchParams.partTime = true;
    } else if (jobType === 'contract') {
      searchParams.contract = true;
    }

    // Add posted within filter (days)
    if (postedWithin) {
      searchParams.maxDaysOld = Number(postedWithin);
    }

    // Parse salary filter
    if (salary) {
      const salaryStr = salary as string;
      if (salaryStr.includes('-')) {
        const [min, max] = salaryStr.split('-').map(s => parseInt(s.replace(/\D/g, '')) * 1000);
        searchParams.salaryMin = min;
        searchParams.salaryMax = max;
      } else if (salaryStr.includes('+')) {
        searchParams.salaryMin = parseInt(salaryStr.replace(/\D/g, '')) * 1000;
      }
    }

    // Search jobs using Adzuna API
    const result = await adzunaService.searchJobs(searchParams);

    // Apply remote filter (post-process since Adzuna doesn't have a direct remote filter)
    let jobs = result.jobs;
    if (remote === 'true') {
      jobs = jobs.filter(
        (j) =>
          j.location.toLowerCase().includes('remote') ||
          j.title.toLowerCase().includes('remote') ||
          j.type.toLowerCase().includes('remote')
      );
    }

    res.json({
      success: true,
      data: {
        jobs,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        filters: {
          keywords,
          location,
          experienceLevel,
          jobType,
          remote,
          sortBy,
        },
        source: 'Adzuna',
      },
    });
  } catch (error: any) {
    console.error('Job search error:', error);

    // Return user-friendly error message
    if (error.message.includes('credentials')) {
      return res.status(503).json({
        success: false,
        error: 'Job search service configuration error. Please contact support.',
      });
    }

    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait a moment and try again.',
      });
    }

    next(error);
  }
};

export const getJobDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { url } = req.query;

    // In production, this would fetch the actual job details
    // For now, generate expanded details
    // Call AI with automatic credit deduction and usage logging
    const responseText = await callAIRaw(
      'Generate detailed job listing information.',
      `Generate full job details for a position. Include:
- Full description
- Responsibilities (5-7 items)
- Requirements (5-7 items)
- Nice to have (3-4 items)
- Benefits (5-6 items)
- Company culture description

Return as JSON:
{
  "fullDescription": "...",
  "responsibilities": ["..."],
  "requirements": ["..."],
  "niceToHave": ["..."],
  "benefits": ["..."],
  "culture": "..."
}`,
      req.user!.id,
      'job_details_generation',
      1500,
      0.7
    );

    let details = {
      fullDescription: '',
      responsibilities: [],
      requirements: [],
      niceToHave: [],
      benefits: [],
      culture: '',
    };

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        details = { ...details, ...JSON.parse(jsonMatch[0]) };
      }
    } catch {
      // Use default
    }

    res.json({
      success: true,
      data: details,
    });
  } catch (error: any) {
    console.error('Job details error:', error);
    next(error);
  }
};

export const saveJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId, jobData } = req.body;
    const userId = req.user!.id;

    if (!jobId || !jobData) {
      return res.status(400).json({
        success: false,
        error: 'Job ID and job data are required',
      });
    }

    // Check if already saved
    const existing = await prisma.savedJob.findUnique({
      where: {
        userId_externalJobId: {
          userId,
          externalJobId: jobId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Job already saved',
        data: existing,
      });
    }

    // Save the job
    const savedJob = await prisma.savedJob.create({
      data: {
        userId,
        externalJobId: jobId,
        source: jobData.source || 'Adzuna',
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        salary: jobData.salary || null,
        jobType: jobData.type || null,
        description: jobData.description,
        url: jobData.url,
        postedAt: jobData.postedAt || null,
        logoUrl: jobData.logoUrl || null,
      },
    });

    res.json({
      success: true,
      message: 'Job saved successfully',
      data: savedJob,
    });
  } catch (error: any) {
    console.error('Save job error:', error);
    next(error);
  }
};

export const getSavedJobs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [savedJobs, total] = await Promise.all([
      prisma.savedJob.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.savedJob.count({
        where: { userId },
      }),
    ]);

    // Transform to match job listing format
    const jobs = savedJobs.map((job) => ({
      id: job.externalJobId,
      savedJobId: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary || '',
      type: job.jobType || '',
      description: job.description,
      url: job.url,
      postedAt: job.postedAt || '',
      logoUrl: job.logoUrl || '',
      source: job.source,
      savedAt: job.createdAt,
      notes: job.notes,
    }));

    res.json({
      success: true,
      data: {
        jobs,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get saved jobs error:', error);
    next(error);
  }
};

export const deleteSavedJob = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.params;
    const userId = req.user!.id;

    // Find and delete the saved job
    const savedJob = await prisma.savedJob.findUnique({
      where: {
        userId_externalJobId: {
          userId,
          externalJobId: jobId,
        },
      },
    });

    if (!savedJob) {
      return res.status(404).json({
        success: false,
        error: 'Saved job not found',
      });
    }

    await prisma.savedJob.delete({
      where: {
        id: savedJob.id,
      },
    });

    res.json({
      success: true,
      message: 'Job removed from saved jobs',
    });
  } catch (error: any) {
    console.error('Delete saved job error:', error);
    next(error);
  }
};

export const getRecommendedJobs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { resumeId } = req.query;

    // Get user's resume data for recommendations
    let skills: string[] = [];
    let jobTitles: string[] = [];

    if (resumeId) {
      const resume = await prisma.resume.findFirst({
        where: {
          id: resumeId as string,
          userId: req.user!.id,
        },
      });

      if (resume?.parsedData) {
        const parsed = resume.parsedData as any;
        skills = parsed.skills || [];
        jobTitles = (parsed.experience || []).map((e: any) => e.title).filter(Boolean);
      }
    }

    // Build search keywords from skills and job titles
    let keywords = 'software developer'; // Default
    if (jobTitles.length > 0) {
      keywords = jobTitles[0]; // Use most recent job title
    } else if (skills.length > 0) {
      keywords = skills.slice(0, 3).join(' ');
    }

    // Check if Adzuna is configured
    let jobs: adzunaService.JobListing[] = [];
    if (adzunaService.isAdzunaConfigured()) {
      try {
        const result = await adzunaService.searchJobs({
          keywords,
          resultsPerPage: 5,
          sortBy: 'date',
        });
        jobs = result.jobs;
      } catch (error) {
        console.error('Adzuna error for recommendations:', error);
        // Return empty on error
      }
    }

    res.json({
      success: true,
      data: {
        jobs: jobs.slice(0, 5),
        basedOn: {
          skills: skills.slice(0, 5),
          recentTitles: jobTitles.slice(0, 2),
        },
      },
    });
  } catch (error: any) {
    console.error('Recommended jobs error:', error);
    next(error);
  }
};
