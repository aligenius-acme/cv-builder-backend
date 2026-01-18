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

    const prompt = `You are a CRITICAL resume analyst. Provide an HONEST performance score - most resumes score 40-65, not 80+.

SCORING GUIDELINES (BE STRICT):
- 90-100: Exceptional resume (top 1%) - rare, almost never given
- 75-89: Strong resume with minor improvements needed
- 60-74: Average resume - functional but not competitive
- 45-59: Below average - needs significant work
- 30-44: Weak resume - major issues
- 0-29: Poor resume - needs complete rewrite

A resume with:
- No metrics = automatic cap at 60 for quantification
- Generic buzzwords without evidence = cap at 50 for uniqueness
- Missing sections = cap at 50 for completeness
- Vague bullet points = cap at 55 for impact language

Return a JSON object:
{
  "overallScore": <number 0-100 - BE HONEST, most resumes are 45-65>,
  "categories": {
    "impactLanguage": {
      "score": <0-100 - penalize heavily for weak verbs and vague statements>,
      "description": "<honest assessment>",
      "suggestions": ["<specific improvement with example>", ...]
    },
    "quantification": {
      "score": <0-100 - count actual metrics, most resumes score 30-50 here>,
      "description": "<honest assessment>",
      "bulletsWithMetrics": <actual count>,
      "totalBullets": <actual count>,
      "suggestions": ["<specific improvement with example>", ...]
    },
    "keywordOptimization": {
      "score": <0-100 - based on industry-relevant keywords present>,
      "description": "<honest assessment>",
      "strongKeywords": ["<actual relevant keywords found>", ...],
      "missingKeywords": ["<important keywords missing for their field>", ...],
      "suggestions": ["<specific improvement>", ...]
    },
    "readability": {
      "score": <0-100>,
      "description": "<honest assessment>",
      "avgSentenceLength": <number>,
      "suggestions": ["<specific improvement>", ...]
    },
    "uniqueness": {
      "score": <0-100 - penalize heavily for clichés and generic phrases>,
      "description": "<honest assessment>",
      "genericPhrases": ["<overused phrases found>", ...],
      "suggestions": ["<specific improvement>", ...]
    },
    "completeness": {
      "score": <0-100>,
      "description": "<honest assessment>",
      "missingSections": ["<missing sections>", ...],
      "suggestions": ["<specific improvement>", ...]
    }
  },
  "topStrengths": ["<genuine strengths only - OK to have fewer than 3 if resume is weak>"],
  "priorityImprovements": ["<most critical fixes needed>", "<second priority>", "<third priority>"],
  "competitiveAnalysis": "<HONEST assessment of how this compares to other candidates - tell them if they'd struggle to get interviews>",
  "bluntAssessment": "<1-2 sentence brutally honest summary>"
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
    await logAIUsage({
      userId,
      operation: 'resume_performance_score',
      provider: 'groq',
      model: config.ai.groqModel,
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
    const { currentSkills, targetRole, experienceLevel, industry, resumeId, targetJobTitle, targetJobDescription } = req.body;

    let skillsToAnalyze = currentSkills || [];

    // If resumeId provided, extract skills from resume
    if (resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
      });

      if (resume && resume.parsedData) {
        const parsed = resume.parsedData as any;
        skillsToAnalyze = parsed.skills || [];
      }
    }

    if (!skillsToAnalyze.length && !resumeId) {
      res.status(400).json({ success: false, error: 'Please provide currentSkills or resumeId' });
      return;
    }

    const roleToAnalyze = targetRole || targetJobTitle || 'Software Engineer';

    const startTime = Date.now();

    const prompt = `You are a REALISTIC career advisor. Analyze the skill gap HONESTLY - don't sugarcoat if there's a significant gap.

CRITICAL RULES FOR HONEST ASSESSMENT:
1. matchPercentage should be MATHEMATICAL: (skills they have / skills required) * 100
2. If they're missing critical skills, readinessLevel should reflect that honestly
3. Don't inflate matchPercentage to make them feel good - a 40% match IS a 40% match
4. Time estimates for learning should be REALISTIC - you can't become proficient in a new programming language in 2 weeks
5. If the gap is significant, SAY SO clearly

MATCH PERCENTAGE GUIDELINES:
- 80-100%: Ready to apply now
- 60-79%: Almost ready, minor gaps to address
- 40-59%: Significant development needed (months of work)
- 20-39%: Major gap - consider intermediate roles first
- 0-19%: Different career path needed

Return a JSON object:
{
  "currentSkills": {
    "technical": ["<only skills ACTUALLY listed>", ...],
    "soft": ["<only if mentioned>", ...],
    "tools": ["<only tools mentioned>", ...],
    "certifications": ["<only if listed>", ...]
  },
  "requiredSkills": {
    "technical": ["<required for target role>", ...],
    "soft": ["<required for target role>", ...],
    "tools": ["<required for target role>", ...],
    "certifications": ["<required or strongly preferred>", ...]
  },
  "skillGaps": [
    {
      "skill": "<missing skill>",
      "category": "technical|soft|tools|certification",
      "importance": "critical (dealbreaker)|important (strong preference)|nice-to-have",
      "currentLevel": "none|beginner|intermediate|advanced",
      "requiredLevel": "beginner|intermediate|advanced|expert",
      "learningPath": {
        "estimatedTime": "<REALISTIC time - learning React basics takes 2-3 months, not 2 weeks>",
        "resources": [
          {
            "type": "course|book|tutorial|certification|project",
            "name": "<real resource name>",
            "provider": "<real provider>",
            "cost": "free|paid",
            "duration": "<realistic duration>"
          }
        ]
      }
    }
  ],
  "matchPercentage": <HONEST 0-100 - most career changers score 30-50>,
  "readinessLevel": "ready (75%+)|almost-ready (60-74%)|needs-development (40-59%)|significant-gap (20-39%)|major-pivot-needed (<20%)",
  "prioritizedActions": [
    {
      "action": "<specific action>",
      "impact": "high|medium|low",
      "timeframe": "<REALISTIC timeframe>",
      "description": "<why this matters>"
    }
  ],
  "careerPathInsights": "<HONEST assessment - if they need intermediate steps, say so>",
  "honestAssessment": "<1-2 sentences of blunt truth about their readiness>"
}

Candidate Skills: ${Array.isArray(skillsToAnalyze) ? skillsToAnalyze.join(', ') : skillsToAnalyze}
${experienceLevel ? `Experience Level: ${experienceLevel}` : ''}

Target Role: ${roleToAnalyze}
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

    await logAIUsage({
      userId,
      operation: 'skill_gap_analysis',
      provider: 'groq',
      model: config.ai.groqModel,
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

    // Flatten examples into the expected format
    let flattenedExamples: any[] = [];
    Object.entries(examples).forEach(([key, category]) => {
      category.examples.forEach((ex: any, idx: number) => {
        flattenedExamples.push({
          id: `${key}-${idx}`,
          occupation: category.title,
          industry: category.industry,
          experienceLevel: ex.level === 'entry' ? 'Entry Level' : ex.level === 'mid' ? 'Mid Level' : 'Senior Level',
          title: ex.title,
          summary: ex.summary,
          highlights: ex.experience[0]?.highlights?.slice(0, 3) || [],
          skills: ex.skills || [],
          previewContent: {
            summary: ex.summary,
            experience: ex.experience.map((e: any) => ({
              title: e.position,
              company: e.company,
              bullets: e.highlights || [],
            })),
          },
        });
      });
    });

    // Filter by occupation if specified
    if (occupation) {
      flattenedExamples = flattenedExamples.filter(
        (ex) => ex.id.startsWith(occupation as string) || ex.occupation.toLowerCase().includes((occupation as string).toLowerCase())
      );
    }

    if (industry) {
      flattenedExamples = flattenedExamples.filter((ex) =>
        ex.industry.toLowerCase().includes((industry as string).toLowerCase())
      );
    }

    if (experienceLevel) {
      flattenedExamples = flattenedExamples.filter((ex) =>
        ex.experienceLevel.toLowerCase().includes((experienceLevel as string).toLowerCase())
      );
    }

    // Get list of available occupations
    const occupations = Object.entries(examples).map(([key, value]) => ({
      id: key,
      title: value.title,
      industry: value.industry,
    }));

    // Get unique industries
    const industries = [...new Set(Object.values(examples).map((v) => v.industry))];

    res.json({
      success: true,
      data: {
        examples: flattenedExamples,
        occupations,
        industries,
        total: flattenedExamples.length,
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
