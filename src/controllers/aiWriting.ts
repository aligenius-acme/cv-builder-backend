import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { callAIRaw, getPrompt } from '../services/ai';
import { prisma } from '../utils/prisma';

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

    let systemPrompt = await getPrompt('writing_suggestions');

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

    // Call AI with automatic credit deduction and usage logging
    const responseText = await callAIRaw(
      systemPrompt,
      userPrompt,
      req.user!.id,
      'writing_suggestions',
      500,
      0.4 // Lower temperature for more consistent, realistic suggestions
    );

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

    // Note: AI credits are automatically deducted by callAIRaw() in ai.ts

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

    // Call AI with automatic credit deduction and usage logging
    const responseText = await callAIRaw(
      systemPrompt,
      userPrompt,
      req.user!.id,
      'writing_completions',
      150,
      0.6
    );

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

    const systemPrompt = await getPrompt('generate_bullets');

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

    // Call AI with automatic credit deduction and usage logging
    const responseText = await callAIRaw(
      systemPrompt,
      userPrompt,
      req.user!.id,
      'generate_bullets',
      600,
      0.4 // Lower temperature for more realistic suggestions
    );

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

    // Note: AI credits are automatically deducted by callAIRaw() in ai.ts

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
