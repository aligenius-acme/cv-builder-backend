import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Groq } from 'groq-sdk';
import { config } from '../config';
import { prisma } from '../utils/prisma';

const groq = new Groq({
  apiKey: config.ai.groqApiKey,
});

interface Question {
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'company-specific';
  difficulty: 'easy' | 'medium' | 'hard';
  tips?: string;
  sampleAnswer?: string;
}

export const generateQuestions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobTitle, company, industry, jobDescription, resumeData, questionTypes } = req.body;

    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        error: 'Job title is required',
      });
    }

    const systemPrompt = `You are an expert career coach and interview preparation specialist.
Generate realistic interview questions that a candidate would face for this position.
Consider the industry, role level, and company culture in your questions.`;

    let userPrompt = `Generate 10 interview questions for this position:
Job Title: ${jobTitle}`;

    if (company) {
      userPrompt += `\nCompany: ${company}`;
    }
    if (industry) {
      userPrompt += `\nIndustry: ${industry}`;
    }
    if (jobDescription) {
      userPrompt += `\nJob Description: ${jobDescription.substring(0, 1000)}`;
    }
    if (resumeData) {
      userPrompt += `\nCandidate Background: ${JSON.stringify(resumeData).substring(0, 500)}`;
    }

    const typesToInclude = questionTypes || ['behavioral', 'technical', 'situational'];
    userPrompt += `\n\nInclude these question types: ${typesToInclude.join(', ')}

Return as JSON array with this structure:
[
  {
    "question": "...",
    "category": "behavioral" | "technical" | "situational" | "company-specific",
    "difficulty": "easy" | "medium" | "hard",
    "tips": "Brief tip for answering",
    "sampleAnswer": "A strong sample answer"
  }
]`;

    const completion = await groq.chat.completions.create({
      model: config.ai.groqModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';

    let questions: Question[] = [];
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch {
      questions = [];
    }

    // Log AI usage
    await prisma.aIUsageLog.create({
      data: {
        userId: req.user!.id,
        operation: 'interview_questions',
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
        model: config.ai.groqModel,
        success: true,
      },
    });

    res.json({
      success: true,
      data: {
        questions,
        jobTitle,
        company,
      },
    });
  } catch (error: any) {
    console.error('Interview question generation error:', error);
    next(error);
  }
};

export const evaluateAnswer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { question, answer, jobTitle, company } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        error: 'Question and answer are required',
      });
    }

    const systemPrompt = `You are an expert interview coach. Evaluate the candidate's answer objectively.
Provide constructive feedback that helps them improve.
Be encouraging but honest about areas for improvement.`;

    const userPrompt = `Evaluate this interview answer:

Position: ${jobTitle || 'Not specified'}${company ? ` at ${company}` : ''}

Question: "${question}"

Candidate's Answer: "${answer}"

Provide evaluation in this JSON format:
{
  "score": (1-10),
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "improvedAnswer": "A stronger version of their answer",
  "feedback": "Overall brief feedback paragraph"
}`;

    const completion = await groq.chat.completions.create({
      model: config.ai.groqModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';

    let evaluation = {
      score: 5,
      strengths: [],
      improvements: [],
      improvedAnswer: '',
      feedback: '',
    };

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Use default
    }

    // Log AI usage
    await prisma.aIUsageLog.create({
      data: {
        userId: req.user!.id,
        operation: 'answer_evaluation',
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
        model: config.ai.groqModel,
        success: true,
      },
    });

    res.json({
      success: true,
      data: evaluation,
    });
  } catch (error: any) {
    console.error('Answer evaluation error:', error);
    next(error);
  }
};

export const getCommonQuestions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.query;

    // Common interview questions organized by category
    const commonQuestions: Record<string, Question[]> = {
      behavioral: [
        {
          question: 'Tell me about a time when you had to deal with a difficult coworker.',
          category: 'behavioral',
          difficulty: 'medium',
          tips: 'Use the STAR method: Situation, Task, Action, Result',
        },
        {
          question: 'Describe a situation where you had to meet a tight deadline.',
          category: 'behavioral',
          difficulty: 'medium',
          tips: 'Focus on your time management and prioritization skills',
        },
        {
          question: 'Tell me about a time you failed and what you learned from it.',
          category: 'behavioral',
          difficulty: 'hard',
          tips: 'Be honest, show self-awareness and growth',
        },
        {
          question: 'Give an example of when you showed leadership.',
          category: 'behavioral',
          difficulty: 'medium',
          tips: 'Leadership can be shown without a formal title',
        },
        {
          question: 'Describe a time when you had to adapt to a major change.',
          category: 'behavioral',
          difficulty: 'medium',
          tips: 'Emphasize flexibility and positive attitude',
        },
      ],
      situational: [
        {
          question: 'How would you handle a disagreement with your manager?',
          category: 'situational',
          difficulty: 'medium',
          tips: 'Show respect while maintaining your perspective',
        },
        {
          question: 'What would you do if you discovered a colleague was not pulling their weight?',
          category: 'situational',
          difficulty: 'hard',
          tips: 'Balance between being a team player and maintaining standards',
        },
        {
          question: 'How would you prioritize multiple urgent tasks?',
          category: 'situational',
          difficulty: 'easy',
          tips: 'Discuss your prioritization framework',
        },
        {
          question: 'What would you do if you realized you made a significant mistake?',
          category: 'situational',
          difficulty: 'medium',
          tips: 'Emphasize taking responsibility and quick corrective action',
        },
      ],
      general: [
        {
          question: 'Tell me about yourself.',
          category: 'behavioral',
          difficulty: 'easy',
          tips: 'Keep it professional and relevant to the role',
        },
        {
          question: 'Why do you want to work here?',
          category: 'company-specific',
          difficulty: 'easy',
          tips: 'Research the company thoroughly',
        },
        {
          question: 'Where do you see yourself in 5 years?',
          category: 'behavioral',
          difficulty: 'easy',
          tips: 'Show ambition while being realistic',
        },
        {
          question: 'What are your greatest strengths and weaknesses?',
          category: 'behavioral',
          difficulty: 'medium',
          tips: 'Be honest and show self-awareness',
        },
        {
          question: 'Why are you leaving your current position?',
          category: 'behavioral',
          difficulty: 'medium',
          tips: 'Stay positive, focus on growth opportunities',
        },
      ],
    };

    const selectedCategory = category as string || 'all';
    let questions: Question[];

    if (selectedCategory === 'all') {
      questions = Object.values(commonQuestions).flat();
    } else if (commonQuestions[selectedCategory]) {
      questions = commonQuestions[selectedCategory];
    } else {
      questions = [];
    }

    res.json({
      success: true,
      data: {
        questions,
        categories: Object.keys(commonQuestions),
      },
    });
  } catch (error: any) {
    next(error);
  }
};
