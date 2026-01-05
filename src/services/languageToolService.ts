import axios from 'axios';

// LanguageTool API - FREE tier: 20 requests/minute, 10KB/request
// API Documentation: https://languagetool.org/http-api/

const LANGUAGETOOL_API_URL = 'https://api.languagetool.org/v2';

export interface GrammarMatch {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: { value: string }[];
  rule: {
    id: string;
    description: string;
    category: {
      id: string;
      name: string;
    };
  };
  context: {
    text: string;
    offset: number;
    length: number;
  };
  sentence: string;
}

export interface GrammarCheckResult {
  matches: GrammarMatch[];
  language: {
    name: string;
    code: string;
  };
  software: {
    name: string;
    version: string;
  };
}

export interface WritingSuggestion {
  type: 'grammar' | 'spelling' | 'style' | 'punctuation' | 'typography';
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  originalText: string;
  suggestions: string[];
  category: string;
  ruleId: string;
  sentence: string;
}

// Check text for grammar, spelling, and style issues
export async function checkGrammar(
  text: string,
  language: string = 'en-US'
): Promise<WritingSuggestion[]> {
  try {
    // Truncate text to 10KB limit for free tier
    const truncatedText = text.slice(0, 10000);

    const response = await axios.post<GrammarCheckResult>(
      `${LANGUAGETOOL_API_URL}/check`,
      new URLSearchParams({
        text: truncatedText,
        language,
        enabledOnly: 'false',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 15000,
      }
    );

    // Transform to our format
    return response.data.matches.map((match) => {
      // Determine type from category
      let type: WritingSuggestion['type'] = 'grammar';
      const categoryId = match.rule.category.id.toLowerCase();

      if (categoryId.includes('typo') || categoryId.includes('spell')) {
        type = 'spelling';
      } else if (categoryId.includes('style') || categoryId.includes('redundancy')) {
        type = 'style';
      } else if (categoryId.includes('punct')) {
        type = 'punctuation';
      } else if (categoryId.includes('typo') || categoryId.includes('whitespace')) {
        type = 'typography';
      }

      return {
        type,
        message: match.message,
        shortMessage: match.shortMessage || match.message.split('.')[0],
        offset: match.offset,
        length: match.length,
        originalText: text.slice(match.offset, match.offset + match.length),
        suggestions: match.replacements.slice(0, 5).map((r) => r.value),
        category: match.rule.category.name,
        ruleId: match.rule.id,
        sentence: match.sentence,
      };
    });
  } catch (error: any) {
    console.error('LanguageTool API error:', error.response?.data || error.message);

    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a minute.');
    }

    throw new Error('Failed to check grammar');
  }
}

// Check multiple sections (for resume/cover letter)
export async function checkMultipleSections(
  sections: { name: string; text: string }[],
  language: string = 'en-US'
): Promise<{ section: string; suggestions: WritingSuggestion[] }[]> {
  const results = [];

  for (const section of sections) {
    if (section.text.trim()) {
      try {
        const suggestions = await checkGrammar(section.text, language);
        results.push({
          section: section.name,
          suggestions,
        });
      } catch (error) {
        // Continue with other sections if one fails
        console.error(`Failed to check section ${section.name}:`, error);
        results.push({
          section: section.name,
          suggestions: [],
        });
      }
    }
  }

  return results;
}

// Get summary statistics
export function getSuggestionStats(suggestions: WritingSuggestion[]): {
  total: number;
  byType: Record<string, number>;
  criticalCount: number;
} {
  const byType: Record<string, number> = {
    grammar: 0,
    spelling: 0,
    style: 0,
    punctuation: 0,
    typography: 0,
  };

  for (const s of suggestions) {
    byType[s.type] = (byType[s.type] || 0) + 1;
  }

  // Grammar and spelling are critical
  const criticalCount = byType.grammar + byType.spelling;

  return {
    total: suggestions.length,
    byType,
    criticalCount,
  };
}

// Check if text is too long for free tier
export function isTextTooLong(text: string): boolean {
  return text.length > 10000;
}

// Get supported languages
export async function getSupportedLanguages(): Promise<{ name: string; code: string; longCode: string }[]> {
  try {
    const response = await axios.get(`${LANGUAGETOOL_API_URL}/languages`);
    return response.data;
  } catch (error) {
    // Return common languages as fallback
    return [
      { name: 'English (US)', code: 'en', longCode: 'en-US' },
      { name: 'English (UK)', code: 'en', longCode: 'en-GB' },
      { name: 'German', code: 'de', longCode: 'de-DE' },
      { name: 'French', code: 'fr', longCode: 'fr-FR' },
      { name: 'Spanish', code: 'es', longCode: 'es-ES' },
    ];
  }
}
