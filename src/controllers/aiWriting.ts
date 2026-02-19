import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import OpenAI from 'openai';
import { config } from '../config';
import { prisma } from '../utils/prisma';

const openai = new OpenAI({
  apiKey: config.ai.openaiApiKey,
});

interface SuggestionRequest {
  text: string;
  context?: {
    jobTitle?: string;
    industry?: string;
    section?: 'experience' | 'summary' | 'skills' | 'education';
    previousBullets?: string[];
  };
  suggestionType: 'improve' | 'expand' | 'quantify' | 'action-verb' | 'complete';
}

export const getSuggestions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { text, context, suggestionType } = req.body as SuggestionRequest;

    if (!text || !suggestionType) {
      return res.status(400).json({
        success: false,
        error: 'Text and suggestionType are required',
      });
    }

    let systemPrompt = `You are an expert resume writer helping to improve bullet points.

CRITICAL RULES:
1. NEVER fabricate specific metrics, percentages, or numbers that weren't implied
2. NEVER add technologies, tools, or skills not mentioned in the original
3. NEVER exaggerate scope (team sizes, budgets, user counts) beyond what's reasonable
4. When quantifying, use REALISTIC ranges (e.g., "improved by 15-25%") rather than suspiciously precise numbers
5. Keep improvements TRUTHFUL and DEFENSIBLE in an interview

Your suggestions should be:
- Professional and impactful but HONEST
- Use strong action verbs appropriate to the actual responsibility level
- Include realistic quantification where the context supports it
- ATS-friendly
- Concise but specific`;

    if (context?.jobTitle) {
      systemPrompt += `\nThe target job title is: ${context.jobTitle}`;
    }
    if (context?.industry) {
      systemPrompt += `\nThe industry is: ${context.industry}`;
    }

    let userPrompt = '';

    switch (suggestionType) {
      case 'improve':
        userPrompt = `Improve this resume bullet point to make it more impactful and professional.
IMPORTANT: Keep improvements truthful - don't inflate the role or add fabricated details.
Provide 3 improved versions that the candidate could confidently defend in an interview.
Original: "${text}"
Return as JSON array of strings.`;
        break;

      case 'expand':
        userPrompt = `Expand this resume bullet point with more detail while keeping it concise.
IMPORTANT: Only add details that are reasonable to infer from the context - don't fabricate specifics.
Provide 2 expanded versions.
Original: "${text}"
Return as JSON array of strings.`;
        break;

      case 'quantify':
        userPrompt = `Add quantifiable metrics to this resume bullet point.
CRITICAL RULES:
- Use REALISTIC ranges rather than suspiciously specific numbers (e.g., "15-25%" not "23.7%")
- Only add metrics that are reasonable given the context
- If the original is too vague to quantify honestly, say so
- Add placeholders like "[X]%" where the user should fill in their actual numbers
Provide 2 quantified versions.
Original: "${text}"
Return as JSON array of strings.`;
        break;

      case 'action-verb':
        userPrompt = `Suggest 5 powerful action verbs that could start this bullet point.
IMPORTANT: Choose verbs appropriate to the actual responsibility level implied - don't suggest "Led" or "Spearheaded" if the original suggests a supporting role.
Original: "${text}"
Return as JSON array of objects with "verb" and "example" properties.`;
        break;

      case 'complete':
        userPrompt = `Complete this partial bullet point with professional content.
IMPORTANT: Keep completions realistic and generic enough that they're likely true. Don't add specific metrics or achievements.
Partial: "${text}"
Provide 3 complete versions.
Return as JSON array of strings.`;
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid suggestion type',
        });
    }

    const completion = await openai.chat.completions.create({
      model: config.ai.openaiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4, // Lower temperature for more consistent, realistic suggestions
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';

    // Parse the JSON response
    let suggestions;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        suggestions = [];
      }
    } catch {
      // If parsing fails, return the raw text as a single suggestion
      suggestions = [responseText];
    }

    // Log AI usage
    await prisma.aIUsageLog.create({
      data: {
        userId: req.user!.id,
        operation: 'writing_suggestion',
        provider: 'openai',
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
        model: config.ai.openaiModel,
        estimatedCost: 0,
        durationMs: 0,
        success: true,
      },
    });

    res.json({
      success: true,
      data: {
        suggestions,
        type: suggestionType,
      },
    });
  } catch (error: any) {
    console.error('AI suggestion error:', error);
    next(error);
  }
};

export const getCompletions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { text, cursorPosition, section } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required',
      });
    }

    const textBeforeCursor = text.substring(0, cursorPosition || text.length);

    const systemPrompt = `You are an AI assistant helping to write resume content.
Complete the following text naturally and professionally.
Keep completions concise (max 10 words).
Only provide the completion text, not the full sentence.`;

    const userPrompt = `Complete this resume ${section || 'content'}:
"${textBeforeCursor}"

Provide 3 possible completions as a JSON array of strings.`;

    const completion = await openai.chat.completions.create({
      model: config.ai.openaiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 150,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';

    let completions;
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        completions = JSON.parse(jsonMatch[0]);
      } else {
        completions = [];
      }
    } catch {
      completions = [];
    }

    res.json({
      success: true,
      data: {
        completions,
      },
    });
  } catch (error: any) {
    console.error('AI completion error:', error);
    next(error);
  }
};

export const generateBulletPoints = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobTitle, company, responsibilities, achievements, targetRole } = req.body;

    if (!jobTitle || !company) {
      return res.status(400).json({
        success: false,
        error: 'Job title and company are required',
      });
    }

    const systemPrompt = `You are an expert resume writer. Generate impactful but REALISTIC bullet points for work experience.

CRITICAL RULES:
1. Generate bullets that are GENERIC enough to be true for most people in this role
2. Use placeholder metrics like "[X]%" or "[N]+" where the user should fill in real numbers
3. Don't include suspiciously specific metrics that would be hard to verify
4. Match the responsibility level to the job title - don't make entry-level roles sound like VP positions
5. Each bullet should be something the candidate can confidently discuss in an interview

Each bullet should:
- Start with a strong action verb appropriate to the seniority level
- Include placeholder metrics that the user should customize with real numbers
- Be specific enough to be useful but generic enough to be true
- Be ATS-friendly`;

    let userPrompt = `Generate 5 professional resume bullet points for this role:
Job Title: ${jobTitle}
Company: ${company}`;

    if (responsibilities) {
      userPrompt += `\nKey responsibilities: ${responsibilities}`;
    }
    if (achievements) {
      userPrompt += `\nKey achievements: ${achievements}`;
    }
    if (targetRole) {
      userPrompt += `\nTarget role: ${targetRole} (tailor bullets for this)`;
    }

    userPrompt += `\n\nIMPORTANT: Use placeholders like [X]%, [N]+, [$X] where users should insert their actual numbers.
Return as a JSON array of strings.`;

    const completion = await openai.chat.completions.create({
      model: config.ai.openaiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4, // Lower temperature for more realistic suggestions
      max_tokens: 600,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';

    let bulletPoints;
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        bulletPoints = JSON.parse(jsonMatch[0]);
      } else {
        bulletPoints = [];
      }
    } catch {
      bulletPoints = [];
    }

    // Log AI usage
    await prisma.aIUsageLog.create({
      data: {
        userId: req.user!.id,
        operation: 'generate_bullets',
        provider: 'openai',
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
        model: config.ai.openaiModel,
        estimatedCost: 0,
        durationMs: 0,
        success: true,
      },
    });

    res.json({
      success: true,
      data: {
        bulletPoints,
      },
    });
  } catch (error: any) {
    console.error('AI bullet generation error:', error);
    next(error);
  }
};
