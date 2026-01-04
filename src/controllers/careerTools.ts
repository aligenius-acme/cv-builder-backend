import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { Groq } from 'groq-sdk';
import config from '../config';
import { logAIUsage } from '../utils/aiLogger';

const groq = new Groq({ apiKey: config.ai.groqApiKey });

// Resume Performance Score - comprehensive scoring beyond ATS
export const getResumePerformanceScore = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { resumeId, versionId } = req.params;

    // Get the resume or version
    let resumeData: any;
    let rawText: string;

    if (versionId) {
      const version = await prisma.resumeVersion.findFirst({
        where: { id: versionId, userId },
      });
      if (!version) {
        res.status(404).json({ success: false, error: 'Version not found' });
        return;
      }
      resumeData = version.tailoredData;
      rawText = version.tailoredText;
    } else {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
      });
      if (!resume) {
        res.status(404).json({ success: false, error: 'Resume not found' });
        return;
      }
      resumeData = resume.parsedData;
      rawText = resume.rawText;
    }

    const startTime = Date.now();

    const prompt = `Analyze this resume and provide a comprehensive performance score. Return a JSON object with the following structure:

{
  "overallScore": <number 0-100>,
  "categories": {
    "impactLanguage": {
      "score": <number 0-100>,
      "description": "<brief explanation>",
      "suggestions": ["<improvement suggestion>", ...]
    },
    "quantification": {
      "score": <number 0-100>,
      "description": "<brief explanation>",
      "bulletsWithMetrics": <number>,
      "totalBullets": <number>,
      "suggestions": ["<improvement suggestion>", ...]
    },
    "keywordOptimization": {
      "score": <number 0-100>,
      "description": "<brief explanation>",
      "strongKeywords": ["<keyword>", ...],
      "missingKeywords": ["<keyword>", ...],
      "suggestions": ["<improvement suggestion>", ...]
    },
    "readability": {
      "score": <number 0-100>,
      "description": "<brief explanation>",
      "avgSentenceLength": <number>,
      "suggestions": ["<improvement suggestion>", ...]
    },
    "uniqueness": {
      "score": <number 0-100>,
      "description": "<brief explanation>",
      "genericPhrases": ["<phrase>", ...],
      "suggestions": ["<improvement suggestion>", ...]
    },
    "completeness": {
      "score": <number 0-100>,
      "description": "<brief explanation>",
      "missingSections": ["<section>", ...],
      "suggestions": ["<improvement suggestion>", ...]
    }
  },
  "topStrengths": ["<strength>", "<strength>", "<strength>"],
  "priorityImprovements": ["<improvement>", "<improvement>", "<improvement>"],
  "competitiveAnalysis": "<brief analysis of how this resume compares to typical industry standards>"
}

Resume:
${rawText}

Parsed Data:
${JSON.stringify(resumeData, null, 2)}`;

    const completion = await groq.chat.completions.create({
      model: config.ai.groqModel,
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume analyst. Analyze resumes and provide detailed scoring with actionable improvements. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const duration = Date.now() - startTime;
    const content = completion.choices[0]?.message?.content || '';

    // Log AI usage
    await logAIUsage(userId, 'resume_performance_score', 'groq', config.ai.groqModel, {
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
      durationMs: duration,
    });

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const performanceScore = JSON.parse(jsonMatch[0]);

    res.json({
      success: true,
      data: performanceScore,
    });
  } catch (error) {
    next(error);
  }
};

// Skill Gap Analyzer
export const analyzeSkillGap = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { resumeId, targetJobTitle, targetJobDescription, industry } = req.body;

    // Get resume data
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      res.status(404).json({ success: false, error: 'Resume not found' });
      return;
    }

    const startTime = Date.now();

    const prompt = `Analyze the skill gap between this candidate's resume and their target role. Return a JSON object:

{
  "currentSkills": {
    "technical": ["<skill>", ...],
    "soft": ["<skill>", ...],
    "tools": ["<tool>", ...],
    "certifications": ["<cert>", ...]
  },
  "requiredSkills": {
    "technical": ["<skill>", ...],
    "soft": ["<skill>", ...],
    "tools": ["<tool>", ...],
    "certifications": ["<cert>", ...]
  },
  "skillGaps": [
    {
      "skill": "<skill name>",
      "category": "technical|soft|tools|certification",
      "importance": "critical|important|nice-to-have",
      "currentLevel": "none|beginner|intermediate|advanced",
      "requiredLevel": "beginner|intermediate|advanced|expert",
      "learningPath": {
        "estimatedTime": "<e.g., 2-4 weeks>",
        "resources": [
          {
            "type": "course|book|tutorial|certification|project",
            "name": "<resource name>",
            "provider": "<provider name>",
            "url": "<optional url>",
            "cost": "free|paid",
            "duration": "<estimated time>"
          }
        ]
      }
    }
  ],
  "matchPercentage": <number 0-100>,
  "readinessLevel": "ready|almost-ready|needs-development|significant-gap",
  "prioritizedActions": [
    {
      "action": "<specific action>",
      "impact": "high|medium|low",
      "timeframe": "<estimated time>",
      "description": "<why this matters>"
    }
  ],
  "careerPathInsights": "<paragraph about career progression and opportunities>"
}

Candidate Resume:
${resume.rawText}

Target Role: ${targetJobTitle}
${targetJobDescription ? `Job Description: ${targetJobDescription}` : ''}
${industry ? `Industry: ${industry}` : ''}`;

    const completion = await groq.chat.completions.create({
      model: config.ai.groqModel,
      messages: [
        {
          role: 'system',
          content: 'You are a career development expert. Analyze skill gaps and provide actionable learning paths with real resources. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 3000,
    });

    const duration = Date.now() - startTime;
    const content = completion.choices[0]?.message?.content || '';

    await logAIUsage(userId, 'skill_gap_analysis', 'groq', config.ai.groqModel, {
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
      durationMs: duration,
    });

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

// Resume Examples Library
export const getResumeExamples = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { occupation, industry, experienceLevel } = req.query;

    // Pre-defined resume examples by occupation
    const examples: Record<string, any> = {
      'software-engineer': {
        title: 'Software Engineer',
        industry: 'Technology',
        levels: ['entry', 'mid', 'senior'],
        examples: [
          {
            level: 'senior',
            title: 'Senior Software Engineer',
            summary: 'Results-driven Senior Software Engineer with 8+ years of experience building scalable web applications. Expert in React, Node.js, and cloud architecture. Led teams of 5-10 engineers, delivering projects that increased revenue by $2M annually.',
            experience: [
              {
                position: 'Senior Software Engineer',
                company: 'Tech Corp',
                duration: '2020 - Present',
                highlights: [
                  'Architected microservices platform handling 10M+ daily requests, reducing latency by 40%',
                  'Led migration from monolith to microservices, improving deployment frequency by 300%',
                  'Mentored 5 junior developers, with 3 receiving promotions within 18 months',
                  'Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes',
                ],
              },
            ],
            skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL', 'Docker', 'Kubernetes'],
          },
          {
            level: 'mid',
            title: 'Software Engineer',
            summary: 'Full-stack Software Engineer with 4 years of experience developing customer-facing applications. Proficient in JavaScript, Python, and cloud technologies. Passionate about clean code and user experience.',
            experience: [
              {
                position: 'Software Engineer',
                company: 'StartupXYZ',
                duration: '2021 - Present',
                highlights: [
                  'Developed React-based dashboard used by 50,000+ users monthly',
                  'Reduced API response time by 60% through database optimization',
                  'Implemented automated testing, achieving 85% code coverage',
                  'Collaborated with product team to define and ship 12 new features',
                ],
              },
            ],
            skills: ['JavaScript', 'React', 'Python', 'Django', 'PostgreSQL', 'AWS', 'Git'],
          },
          {
            level: 'entry',
            title: 'Junior Software Engineer',
            summary: 'Motivated Computer Science graduate with strong foundation in software development. Experience with web technologies through internships and personal projects. Eager to contribute to innovative engineering teams.',
            experience: [
              {
                position: 'Software Engineering Intern',
                company: 'Tech Startup',
                duration: 'Summer 2023',
                highlights: [
                  'Built RESTful API endpoints using Node.js and Express',
                  'Developed React components for customer dashboard',
                  'Participated in code reviews and agile ceremonies',
                  'Fixed 25+ bugs, improving application stability',
                ],
              },
            ],
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'HTML/CSS'],
          },
        ],
      },
      'product-manager': {
        title: 'Product Manager',
        industry: 'Technology',
        levels: ['entry', 'mid', 'senior'],
        examples: [
          {
            level: 'senior',
            title: 'Senior Product Manager',
            summary: 'Strategic Product Manager with 7+ years driving product vision and execution. Launched 15+ products generating $50M+ in revenue. Expert in data-driven decision making and cross-functional leadership.',
            experience: [
              {
                position: 'Senior Product Manager',
                company: 'BigTech Inc',
                duration: '2019 - Present',
                highlights: [
                  'Led product strategy for $30M ARR product line, growing revenue 40% YoY',
                  'Launched mobile app achieving 4.8 star rating and 1M+ downloads',
                  'Managed roadmap prioritization using data from 500K+ user sessions',
                  'Built and led team of 3 product managers and 2 analysts',
                ],
              },
            ],
            skills: ['Product Strategy', 'Roadmapping', 'A/B Testing', 'SQL', 'Figma', 'Jira', 'User Research'],
          },
        ],
      },
      'data-scientist': {
        title: 'Data Scientist',
        industry: 'Technology',
        levels: ['entry', 'mid', 'senior'],
        examples: [
          {
            level: 'senior',
            title: 'Senior Data Scientist',
            summary: 'Data Scientist with 6+ years of experience in machine learning and statistical analysis. Built production ML systems serving millions of users. Expert in Python, deep learning, and NLP.',
            experience: [
              {
                position: 'Senior Data Scientist',
                company: 'AI Company',
                duration: '2020 - Present',
                highlights: [
                  'Developed recommendation engine increasing user engagement by 35%',
                  'Built NLP pipeline processing 10M+ documents daily with 95% accuracy',
                  'Reduced customer churn by 20% through predictive modeling',
                  'Mentored team of 4 data scientists on ML best practices',
                ],
              },
            ],
            skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Spark', 'AWS SageMaker', 'NLP'],
          },
        ],
      },
      'marketing-manager': {
        title: 'Marketing Manager',
        industry: 'Marketing',
        levels: ['entry', 'mid', 'senior'],
        examples: [
          {
            level: 'senior',
            title: 'Senior Marketing Manager',
            summary: 'Results-oriented Marketing Manager with 8+ years driving brand growth and customer acquisition. Generated $10M+ in pipeline through integrated campaigns. Expert in digital marketing and brand strategy.',
            experience: [
              {
                position: 'Senior Marketing Manager',
                company: 'Consumer Brand',
                duration: '2019 - Present',
                highlights: [
                  'Increased brand awareness by 150% through integrated marketing campaigns',
                  'Managed $5M annual marketing budget with 3x ROI',
                  'Grew social media following from 50K to 500K in 18 months',
                  'Led team of 6 marketers across content, paid, and brand functions',
                ],
              },
            ],
            skills: ['Digital Marketing', 'Brand Strategy', 'Google Analytics', 'HubSpot', 'SEO/SEM', 'Content Marketing'],
          },
        ],
      },
      'ux-designer': {
        title: 'UX Designer',
        industry: 'Design',
        levels: ['entry', 'mid', 'senior'],
        examples: [
          {
            level: 'senior',
            title: 'Senior UX Designer',
            summary: 'User-centered UX Designer with 6+ years creating intuitive digital experiences. Led design for products with 5M+ users. Expert in design systems, user research, and accessibility.',
            experience: [
              {
                position: 'Senior UX Designer',
                company: 'Design Agency',
                duration: '2020 - Present',
                highlights: [
                  'Redesigned checkout flow, increasing conversion rate by 45%',
                  'Created design system adopted across 12 products and 30+ designers',
                  'Conducted 100+ user interviews informing product roadmap',
                  'Achieved WCAG 2.1 AA compliance across all products',
                ],
              },
            ],
            skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility', 'Usability Testing'],
          },
        ],
      },
      'project-manager': {
        title: 'Project Manager',
        industry: 'Various',
        levels: ['entry', 'mid', 'senior'],
        examples: [
          {
            level: 'senior',
            title: 'Senior Project Manager',
            summary: 'PMP-certified Project Manager with 10+ years leading complex initiatives. Delivered $100M+ in projects on time and under budget. Expert in Agile and Waterfall methodologies.',
            experience: [
              {
                position: 'Senior Project Manager',
                company: 'Consulting Firm',
                duration: '2018 - Present',
                highlights: [
                  'Managed portfolio of 15 projects with combined budget of $25M',
                  'Delivered enterprise transformation project 2 months ahead of schedule',
                  'Reduced project delivery time by 30% through process optimization',
                  'Led cross-functional teams of 20-50 members across 5 countries',
                ],
              },
            ],
            skills: ['PMP', 'Agile/Scrum', 'Waterfall', 'MS Project', 'Jira', 'Risk Management', 'Stakeholder Management'],
          },
        ],
      },
    };

    // Filter by occupation if specified
    let filteredExamples = Object.entries(examples).map(([key, value]) => ({
      id: key,
      ...value,
    }));

    if (occupation) {
      filteredExamples = filteredExamples.filter(
        (ex) => ex.id === occupation || ex.title.toLowerCase().includes((occupation as string).toLowerCase())
      );
    }

    if (industry) {
      filteredExamples = filteredExamples.filter((ex) =>
        ex.industry.toLowerCase().includes((industry as string).toLowerCase())
      );
    }

    // Get list of available occupations
    const occupations = Object.entries(examples).map(([key, value]) => ({
      id: key,
      title: value.title,
      industry: value.industry,
    }));

    res.json({
      success: true,
      data: {
        examples: filteredExamples,
        occupations,
        total: filteredExamples.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Career Dashboard Stats
export const getCareerDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const [
      resumeCount,
      versionCount,
      coverLetterCount,
      applicationStats,
      upcomingInterviews,
      upcomingDeadlines,
      recentActivity,
    ] = await Promise.all([
      prisma.resume.count({ where: { userId } }),
      prisma.resumeVersion.count({ where: { userId } }),
      prisma.coverLetter.count({ where: { userId } }),
      prisma.jobApplication.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      prisma.jobApplication.findMany({
        where: {
          userId,
          interviewDate: { gte: new Date() },
          status: { in: ['SCREENING', 'INTERVIEWING'] },
        },
        orderBy: { interviewDate: 'asc' },
        take: 5,
      }),
      prisma.jobApplication.findMany({
        where: {
          userId,
          deadline: { gte: new Date() },
          status: { in: ['WISHLIST', 'APPLIED'] },
        },
        orderBy: { deadline: 'asc' },
        take: 5,
      }),
      prisma.jobActivity.findMany({
        where: { jobApplication: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          jobApplication: {
            select: { jobTitle: true, companyName: true },
          },
        },
      }),
    ]);

    // Calculate application stats
    const statusCounts: Record<string, number> = {};
    applicationStats.forEach((s) => {
      statusCounts[s.status] = s._count;
    });

    const totalApplications = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const applied = (statusCounts['APPLIED'] || 0) + (statusCounts['SCREENING'] || 0) +
                   (statusCounts['INTERVIEWING'] || 0) + (statusCounts['OFFER'] || 0) +
                   (statusCounts['ACCEPTED'] || 0) + (statusCounts['REJECTED'] || 0);
    const responses = (statusCounts['SCREENING'] || 0) + (statusCounts['INTERVIEWING'] || 0) +
                     (statusCounts['OFFER'] || 0) + (statusCounts['ACCEPTED'] || 0) +
                     (statusCounts['REJECTED'] || 0);
    const responseRate = applied > 0 ? Math.round((responses / applied) * 100) : 0;

    res.json({
      success: true,
      data: {
        documents: {
          resumes: resumeCount,
          versions: versionCount,
          coverLetters: coverLetterCount,
        },
        applications: {
          total: totalApplications,
          byStatus: statusCounts,
          responseRate,
          wishlist: statusCounts['WISHLIST'] || 0,
          active: (statusCounts['APPLIED'] || 0) + (statusCounts['SCREENING'] || 0) + (statusCounts['INTERVIEWING'] || 0),
          offers: statusCounts['OFFER'] || 0,
          accepted: statusCounts['ACCEPTED'] || 0,
        },
        upcoming: {
          interviews: upcomingInterviews,
          deadlines: upcomingDeadlines,
        },
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
