import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Groq } from 'groq-sdk';
import { config } from '../config';
import { prisma } from '../utils/prisma';
import * as adzunaService from '../services/adzunaService';

const groq = new Groq({
  apiKey: config.ai.groqApiKey,
});

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
    const completion = await groq.chat.completions.create({
      model: config.ai.groqModel,
      messages: [
        {
          role: 'system',
          content: 'Generate detailed job listing information.',
        },
        {
          role: 'user',
          content: `Generate full job details for a position. Include:
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
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';

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

    // In production, this would save to a SavedJob table
    // For now, just acknowledge the save

    res.json({
      success: true,
      message: 'Job saved successfully',
      data: { jobId },
    });
  } catch (error: any) {
    next(error);
  }
};

export const getSavedJobs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // In production, this would fetch from SavedJob table
    res.json({
      success: true,
      data: {
        jobs: [],
        total: 0,
      },
    });
  } catch (error: any) {
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
