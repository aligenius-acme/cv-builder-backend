import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Groq } from 'groq-sdk';
import { config } from '../config';
import { prisma } from '../utils/prisma';

const groq = new Groq({
  apiKey: config.ai.groqApiKey,
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
Your suggestions should be:
- Professional and impactful
- Use strong action verbs
- Be quantifiable when possible
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
Provide 3 improved versions.
Original: "${text}"
Return as JSON array of strings.`;
        break;

      case 'expand':
        userPrompt = `Expand this resume bullet point with more detail while keeping it concise.
Provide 2 expanded versions.
Original: "${text}"
Return as JSON array of strings.`;
        break;

      case 'quantify':
        userPrompt = `Add quantifiable metrics to this resume bullet point. Use realistic estimates if exact numbers aren't provided.
Provide 2 quantified versions.
Original: "${text}"
Return as JSON array of strings.`;
        break;

      case 'action-verb':
        userPrompt = `Suggest 5 powerful action verbs that could start this bullet point.
Original: "${text}"
Return as JSON array of objects with "verb" and "example" properties.`;
        break;

      case 'complete':
        userPrompt = `Complete this partial bullet point with professional content.
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

    const completion = await groq.chat.completions.create({
      model: config.ai.groqModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
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

    const completion = await groq.chat.completions.create({
      model: config.ai.groqModel,
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

    const systemPrompt = `You are an expert resume writer. Generate impactful bullet points for work experience.
Each bullet should:
- Start with a strong action verb
- Include quantifiable results when possible
- Be specific and concise
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

    userPrompt += '\n\nReturn as a JSON array of strings.';

    const completion = await groq.chat.completions.create({
      model: config.ai.groqModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
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
        bulletPoints,
      },
    });
  } catch (error: any) {
    console.error('AI bullet generation error:', error);
    next(error);
  }
};
