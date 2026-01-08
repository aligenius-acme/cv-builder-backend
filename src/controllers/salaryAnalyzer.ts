import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Groq } from 'groq-sdk';
import { config } from '../config';
import { prisma } from '../utils/prisma';

const groq = new Groq({
  apiKey: config.ai.groqApiKey,
});

interface SalaryRange {
  min: number;
  median: number;
  max: number;
  currency: string;
}

interface MarketData {
  role: string;
  location: string;
  experienceLevel: string;
  salaryRange: SalaryRange;
  benefits: string[];
  marketTrends: string[];
  topPayingCompanies: string[];
  negotiationTips: string[];
}

export const analyzeSalary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      jobTitle,
      location,
      experienceYears,
      industry,
      companySize,
      skills,
      currentOffer,
    } = req.body;

    if (!jobTitle || !location) {
      return res.status(400).json({
        success: false,
        error: 'Job title and location are required',
      });
    }

    const systemPrompt = `You are an expert salary analyst with access to current market data.
Provide realistic and well-researched salary estimates based on job market knowledge.
Use USD unless another currency is specified.
Be conservative with estimates and provide ranges.`;

    const userPrompt = `Analyze the salary market for this position:

Job Title: ${jobTitle}
Location: ${location}
Experience: ${experienceYears || 'Not specified'} years
Industry: ${industry || 'Not specified'}
Company Size: ${companySize || 'Not specified'}
Key Skills: ${skills?.join(', ') || 'Not specified'}
${currentOffer ? `Current Offer: ${currentOffer}` : ''}

Provide analysis in this JSON format:
{
  "salaryRange": {
    "min": (number in USD),
    "median": (number in USD),
    "max": (number in USD),
    "currency": "USD"
  },
  "percentile": {
    "25th": (number),
    "50th": (number),
    "75th": (number),
    "90th": (number)
  },
  "factors": [
    {"name": "factor", "impact": "positive" | "negative" | "neutral", "description": "..."}
  ],
  "benefits": {
    "common": ["benefit 1", "benefit 2"],
    "premium": ["benefit 1", "benefit 2"]
  },
  "negotiationTips": ["tip 1", "tip 2", "tip 3"],
  "marketOutlook": "Brief market outlook paragraph",
  "competitorSalaries": [
    {"company": "Company A", "range": "100k-150k"},
    {"company": "Company B", "range": "110k-160k"}
  ]${currentOffer ? `,
  "offerAnalysis": {
    "comparison": "above" | "at" | "below",
    "percentileRank": (number 0-100),
    "recommendation": "Your recommendation"
  }` : ''}
}`;

    const completion = await groq.chat.completions.create({
      model: config.ai.groqModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';

    let analysis = {
      salaryRange: { min: 0, median: 0, max: 0, currency: 'USD' },
      percentile: { '25th': 0, '50th': 0, '75th': 0, '90th': 0 },
      factors: [],
      benefits: { common: [], premium: [] },
      negotiationTips: [],
      marketOutlook: '',
      competitorSalaries: [],
      offerAnalysis: null,
    };

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = { ...analysis, ...JSON.parse(jsonMatch[0]) };
      }
    } catch {
      // Use default
    }

    // Log AI usage
    await prisma.aIUsageLog.create({
      data: {
        userId: req.user!.id,
        operation: 'salary_analysis',
        provider: 'groq',
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
        model: config.ai.groqModel,
        estimatedCost: 0,
        durationMs: 0,
        success: true,
      },
    });

    res.json({
      success: true,
      data: {
        analysis,
        query: {
          jobTitle,
          location,
          experienceYears,
          industry,
        },
      },
    });
  } catch (error: any) {
    console.error('Salary analysis error:', error);
    next(error);
  }
};

export const compareOffers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { offers } = req.body;

    if (!offers || !Array.isArray(offers) || offers.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 offers are required for comparison',
      });
    }

    const systemPrompt = `You are an expert career advisor helping compare job offers.
Consider total compensation, benefits, work-life balance, career growth, and other factors.
Provide objective, actionable advice.`;

    const offersDescription = offers.map((o: any, i: number) => `
Offer ${i + 1}:
- Company: ${o.company}
- Position: ${o.position}
- Base Salary: ${o.baseSalary}
- Bonus: ${o.bonus || 'Not specified'}
- Equity: ${o.equity || 'Not specified'}
- Benefits: ${o.benefits?.join(', ') || 'Not specified'}
- Remote Work: ${o.remoteWork || 'Not specified'}
- PTO Days: ${o.ptoDays || 'Not specified'}
- Location: ${o.location || 'Not specified'}
`).join('\n');

    const userPrompt = `Compare these job offers and help the candidate decide:

${offersDescription}

Provide comparison in this JSON format:
{
  "totalCompensation": [
    {"company": "...", "estimated": (number)}
  ],
  "rankings": {
    "overallValue": ["Company A", "Company B"],
    "baseSalary": ["Company B", "Company A"],
    "benefits": ["Company A", "Company B"],
    "workLifeBalance": ["Company A", "Company B"]
  },
  "prosAndCons": [
    {
      "company": "...",
      "pros": ["pro 1", "pro 2"],
      "cons": ["con 1", "con 2"]
    }
  ],
  "recommendation": {
    "bestFor": {
      "moneyFocused": "Company X",
      "workLifeBalance": "Company Y",
      "careerGrowth": "Company Z"
    },
    "overallPick": "Company X",
    "reasoning": "Explanation paragraph"
  },
  "negotiationSuggestions": [
    {"company": "...", "suggestions": ["suggestion 1"]}
  ]
}`;

    const completion = await groq.chat.completions.create({
      model: config.ai.groqModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';

    let comparison = {
      totalCompensation: [],
      rankings: {},
      prosAndCons: [],
      recommendation: {},
      negotiationSuggestions: [],
    };

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        comparison = { ...comparison, ...JSON.parse(jsonMatch[0]) };
      }
    } catch {
      // Use default
    }

    // Log AI usage
    await prisma.aIUsageLog.create({
      data: {
        userId: req.user!.id,
        operation: 'offer_comparison',
        provider: 'groq',
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
        model: config.ai.groqModel,
        estimatedCost: 0,
        durationMs: 0,
        success: true,
      },
    });

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error: any) {
    console.error('Offer comparison error:', error);
    next(error);
  }
};

export const getNegotiationScript = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      currentOffer,
      targetSalary,
      reasons,
      jobTitle,
      company,
    } = req.body;

    if (!currentOffer || !targetSalary) {
      return res.status(400).json({
        success: false,
        error: 'Current offer and target salary are required',
      });
    }

    const systemPrompt = `You are an expert salary negotiation coach.
Create professional, persuasive negotiation scripts.
Be confident but not aggressive. Focus on value provided.`;

    const userPrompt = `Create a salary negotiation script:

Current Offer: ${currentOffer}
Target Salary: ${targetSalary}
Position: ${jobTitle || 'Not specified'}
Company: ${company || 'Not specified'}
Reasons for increase: ${reasons?.join(', ') || 'Market research, experience, skills'}

Provide in this JSON format:
{
  "openingStatement": "How to start the conversation",
  "keyPoints": [
    {"point": "...", "elaboration": "..."}
  ],
  "responses": {
    "ifTheyPushBack": "How to respond if they push back",
    "ifTheyNeedTime": "How to respond if they need to think",
    "ifTheyCounterLow": "How to respond to a low counter"
  },
  "closingStatement": "How to close professionally",
  "emailTemplate": "Full email template for written negotiation",
  "tips": ["tip 1", "tip 2"]
}`;

    const completion = await groq.chat.completions.create({
      model: config.ai.groqModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 1200,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';

    let script = {
      openingStatement: '',
      keyPoints: [],
      responses: {},
      closingStatement: '',
      emailTemplate: '',
      tips: [],
    };

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        script = { ...script, ...JSON.parse(jsonMatch[0]) };
      }
    } catch {
      // Use default
    }

    res.json({
      success: true,
      data: script,
    });
  } catch (error: any) {
    console.error('Negotiation script error:', error);
    next(error);
  }
};
