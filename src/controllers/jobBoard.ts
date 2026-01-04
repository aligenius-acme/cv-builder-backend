import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Groq } from 'groq-sdk';
import { config } from '../config';
import { prisma } from '../utils/prisma';
import axios from 'axios';
import * as cheerio from 'cheerio';

const groq = new Groq({
  apiKey: config.ai.groqApiKey,
});

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: string;
  posted: string;
  description: string;
  requirements?: string[];
  source: string;
  url: string;
  logo?: string;
}

// Mock job data for demo - in production, this would scrape real job boards
const generateMockJobs = async (
  keywords: string,
  location: string,
  experienceLevel: string
): Promise<JobListing[]> => {
  const completion = await groq.chat.completions.create({
    model: config.ai.groqModel,
    messages: [
      {
        role: 'system',
        content: `You are a job listing generator. Create realistic job listings based on the search criteria.
Generate varied listings from different companies.`,
      },
      {
        role: 'user',
        content: `Generate 10 realistic job listings for:
Keywords: ${keywords}
Location: ${location}
Experience Level: ${experienceLevel}

Return as JSON array with this structure:
[
  {
    "id": "unique-id",
    "title": "Job Title",
    "company": "Company Name",
    "location": "City, State",
    "salary": "$100k - $150k",
    "type": "Full-time",
    "posted": "2 days ago",
    "description": "Brief job description (2-3 sentences)",
    "requirements": ["requirement 1", "requirement 2"],
    "source": "LinkedIn",
    "url": "#",
    "logo": null
  }
]`,
      },
    ],
    temperature: 0.8,
    max_tokens: 2500,
  });

  const responseText = completion.choices[0]?.message?.content || '[]';

  try {
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Return empty array on parse error
  }

  return [];
};

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
    } = req.query;

    if (!keywords) {
      return res.status(400).json({
        success: false,
        error: 'Keywords are required',
      });
    }

    // Generate mock jobs (in production, this would aggregate from real job boards)
    const jobs = await generateMockJobs(
      keywords as string,
      (location as string) || 'United States',
      (experienceLevel as string) || 'mid-level'
    );

    // Apply filters
    let filteredJobs = jobs;

    if (jobType) {
      filteredJobs = filteredJobs.filter((j) =>
        j.type.toLowerCase().includes((jobType as string).toLowerCase())
      );
    }

    if (remote === 'true') {
      filteredJobs = filteredJobs.filter(
        (j) =>
          j.location.toLowerCase().includes('remote') ||
          j.type.toLowerCase().includes('remote')
      );
    }

    // Log AI usage
    await prisma.aIUsageLog.create({
      data: {
        userId: req.user!.id,
        operation: 'job_search',
        promptTokens: 100,
        completionTokens: 500,
        totalTokens: 600,
        model: config.ai.groqModel,
        success: true,
      },
    });

    res.json({
      success: true,
      data: {
        jobs: filteredJobs,
        total: filteredJobs.length,
        page: Number(page),
        totalPages: Math.ceil(filteredJobs.length / Number(limit)),
        filters: {
          keywords,
          location,
          experienceLevel,
          jobType,
          remote,
        },
      },
    });
  } catch (error: any) {
    console.error('Job search error:', error);
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

    // Generate recommendations based on profile
    const keywords = skills.length > 0 ? skills.slice(0, 3).join(', ') : 'software developer';
    const jobs = await generateMockJobs(keywords, 'United States', 'mid-level');

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
