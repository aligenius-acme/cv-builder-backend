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

    const systemPrompt = `You are an expert salary analyst. Provide REALISTIC and ACCURATE salary estimates.

CRITICAL RULES FOR ACCURACY:
1. Base estimates on real market data patterns - don't inflate to make users feel good
2. Location matters enormously - SF/NYC pay 40-60% more than average US markets
3. Experience years have diminishing returns - 10 years doesn't pay 2x of 5 years
4. Company size matters - startups often pay less base but more equity
5. Be CONSERVATIVE with estimates - it's better to be pleasantly surprised than disappointed
6. Acknowledge uncertainty - salary data varies widely and your knowledge may be dated

COMMON MISTAKES TO AVOID:
- Don't quote top-of-market FAANG salaries as typical
- Don't assume all "Senior" titles mean the same level
- Account for the full compensation picture (base, bonus, equity, benefits)

Use USD unless another currency is specified.`;

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

    const systemPrompt = `You are an expert career advisor helping compare job offers with HONEST, REALISTIC analysis.

CRITICAL RULES:
1. Don't just assume higher salary = better offer - consider total compensation
2. Be realistic about equity value - most startup equity ends up worthless
3. Factor in cost of living differences between locations
4. Consider career trajectory, not just immediate compensation
5. Be honest about trade-offs - there's rarely a clearly "best" option
6. Account for job stability and company financial health

COMMON CANDIDATE MISTAKES TO WARN ABOUT:
- Overvaluing equity at startups (90%+ fail or have minimal exits)
- Ignoring benefits value (health insurance alone can be $15-25k/year value)
- Not factoring in commute/remote work value
- Chasing title over compensation or learning opportunity`;

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
      benefits,
      competingOffers,
    } = req.body;

    if (!currentOffer || !targetSalary) {
      return res.status(400).json({
        success: false,
        error: 'Current offer and target salary are required',
      });
    }

    const systemPrompt = `You are an expert salary negotiation coach with 20+ years experience.
Create professional, persuasive negotiation scripts with specific counter-offer phrases.
Be confident but not aggressive. Focus on value provided.
Include word-for-word scripts the candidate can use.`;

    const userPrompt = `Create a comprehensive salary negotiation toolkit:

Current Offer: ${currentOffer}
Target Salary: ${targetSalary}
Position: ${jobTitle || 'Not specified'}
Company: ${company || 'Not specified'}
Reasons for increase: ${reasons?.join(', ') || 'Market research, experience, skills'}
${benefits ? `Benefits to negotiate: ${benefits}` : ''}
${competingOffers ? `Competing offers: ${competingOffers}` : ''}

Provide in this JSON format:
{
  "openingStatement": "Word-for-word script to start the conversation",
  "keyPoints": [
    {"point": "Value proposition point", "elaboration": "How to elaborate on this", "exactScript": "Word-for-word what to say"}
  ],
  "responses": {
    "ifTheyPushBack": "Word-for-word response if they push back",
    "ifTheyNeedTime": "What to say if they need to think",
    "ifTheyCounterLow": "How to respond to a low counter with specific language",
    "ifTheySayBudgetLimited": "Response if they cite budget constraints",
    "ifTheyAskForJustification": "How to justify your number with data"
  },
  "counterOfferScripts": [
    {
      "scenario": "They offer 10% below your target",
      "script": "Word-for-word what to say",
      "fallbackPosition": "What to say if they won't budge"
    },
    {
      "scenario": "They can't increase base but offer other comp",
      "script": "How to negotiate sign-on bonus, equity, etc.",
      "fallbackPosition": "Minimum acceptable alternative"
    },
    {
      "scenario": "They need to check with HR/leadership",
      "script": "How to maintain leverage while they check",
      "fallbackPosition": "Timeline to set for follow-up"
    }
  ],
  "benefitsNegotiation": {
    "signingBonus": {
      "script": "Word-for-word to negotiate signing bonus",
      "typicalRange": "What's reasonable to ask for"
    },
    "equity": {
      "script": "How to negotiate equity/stock options",
      "typicalRange": "What's reasonable for this level"
    },
    "pto": {
      "script": "How to ask for additional PTO",
      "typicalRange": "What's reasonable"
    },
    "remoteWork": {
      "script": "How to negotiate remote work flexibility",
      "tips": "What to emphasize"
    },
    "startDate": {
      "script": "How to negotiate a later start date",
      "tips": "Why this matters"
    }
  },
  "closingStatement": "How to close professionally",
  "emailTemplates": {
    "initial": "Full email template for initial salary negotiation",
    "counterOffer": "Email template responding to their counter",
    "acceptance": "Email accepting the final offer gracefully",
    "walkAway": "Professional email if you need to decline"
  },
  "walkawayStrategy": {
    "minimumAcceptable": "How to determine your walk-away number",
    "howToDecline": "Word-for-word graceful decline",
    "keepDoorOpen": "How to maintain relationship for future"
  },
  "tips": ["tip 1", "tip 2", "tip 3"],
  "commonMistakes": ["Mistake to avoid 1", "Mistake to avoid 2"],
  "timeline": {
    "whenToNegotiate": "Best timing for negotiation",
    "howLongToWait": "How long to give them to respond",
    "deadlineStrategy": "How to use competing offers as leverage"
  }
}`;

    const completion = await groq.chat.completions.create({
      model: config.ai.groqModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';

    let script: any = {
      openingStatement: '',
      keyPoints: [],
      responses: {},
      counterOfferScripts: [],
      benefitsNegotiation: {},
      closingStatement: '',
      emailTemplates: {},
      walkawayStrategy: {},
      tips: [],
      commonMistakes: [],
      timeline: {},
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
