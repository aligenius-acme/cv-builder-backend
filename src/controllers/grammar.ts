import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import * as languageToolService from '../services/languageToolService';
import { ValidationError } from '../utils/errors';

// Check text for grammar issues
export const checkText = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { text, language = 'en-US' } = req.body;

    if (!text) {
      throw new ValidationError('Text is required');
    }

    if (text.length > 10000) {
      throw new ValidationError('Text is too long. Maximum 10,000 characters allowed.');
    }

    const suggestions = await languageToolService.checkGrammar(text, language);
    const stats = languageToolService.getSuggestionStats(suggestions);

    res.json({
      success: true,
      data: {
        suggestions,
        stats,
        textLength: text.length,
      },
    });
  } catch (error: any) {
    if (error.message.includes('Rate limit')) {
      res.status(429).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
};

// Check resume sections
export const checkResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sections, language = 'en-US' } = req.body;

    if (!sections || !Array.isArray(sections)) {
      throw new ValidationError('Sections array is required');
    }

    // Validate sections
    const validSections = sections.filter(
      (s: any) => s && typeof s.name === 'string' && typeof s.text === 'string'
    );

    if (validSections.length === 0) {
      throw new ValidationError('At least one valid section is required');
    }

    // Check total length
    const totalLength = validSections.reduce((sum: number, s: any) => sum + s.text.length, 0);
    if (totalLength > 10000) {
      throw new ValidationError('Combined text is too long. Maximum 10,000 characters allowed.');
    }

    const results = await languageToolService.checkMultipleSections(validSections, language);

    // Calculate overall stats
    const allSuggestions = results.flatMap((r) => r.suggestions);
    const overallStats = languageToolService.getSuggestionStats(allSuggestions);

    res.json({
      success: true,
      data: {
        sections: results,
        overallStats,
        totalLength,
      },
    });
  } catch (error: any) {
    if (error.message.includes('Rate limit')) {
      res.status(429).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
};

// Get supported languages
export const getLanguages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const languages = await languageToolService.getSupportedLanguages();

    res.json({
      success: true,
      data: {
        languages,
      },
    });
  } catch (error) {
    next(error);
  }
};
