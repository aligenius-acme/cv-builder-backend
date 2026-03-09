import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { executeJsonArrayCompletion, executeJsonCompletion } from '../utils/aiWrapper';
import { sendSuccess, sendValidationError } from '../utils/responseHelpers';
import { deductAICredit } from '../middleware/credits';

interface Question {
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'company-specific';
  difficulty: 'easy' | 'medium' | 'hard';
  tips?: string;
  sampleAnswer?: string;
  // NEW: Enhanced fields
  redFlagAnswers?: string[];
  followUpQuestions?: string[];
  starTemplate?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  scoringRubric?: {
    excellent: string;
    good: string;
    poor: string;
  };
}

export const generateQuestions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobTitle, company, industry, jobDescription, resumeData, questionTypes } = req.body;

    if (!jobTitle) {
      return sendValidationError(res, 'Job title is required');
    }

    const systemPrompt = `You are an expert career coach and interview preparation specialist who has conducted thousands of interviews.

Generate REALISTIC, CHALLENGING interview questions that a candidate would ACTUALLY face for this position. Include the tough questions that trip up candidates, not just softball questions.

QUESTION DIFFICULTY DISTRIBUTION:
- 30% should be genuinely difficult questions that many candidates fail
- 40% should be moderately challenging
- 30% should be standard questions but with high expectations for answers

Include questions that test for:
- Actual technical/domain competence (not just buzzwords)
- Real problem-solving ability
- Honest self-awareness about weaknesses
- Cultural fit concerns interviewers typically have`;

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

Return as JSON array with this enhanced structure:
[
  {
    "question": "The interview question",
    "category": "behavioral" | "technical" | "situational" | "company-specific",
    "difficulty": "easy" | "medium" | "hard",
    "tips": "Brief tip for answering",
    "sampleAnswer": "A strong sample answer demonstrating best practices",
    "redFlagAnswers": [
      "Example of a bad answer that would hurt chances (e.g., 'I've never had to deal with conflict')",
      "Another answer to avoid (e.g., 'I blame others when things go wrong')",
      "Third red flag response to avoid"
    ],
    "followUpQuestions": [
      "A likely follow-up question the interviewer might ask",
      "Another potential follow-up based on the answer"
    ],
    "starTemplate": {
      "situation": "Describe a specific context prompt for STAR method",
      "task": "What was your responsibility prompt",
      "action": "What specific actions did you take prompt",
      "result": "What was the outcome with metrics if possible"
    },
    "scoringRubric": {
      "excellent": "What makes an excellent answer (specific, measurable outcomes, relevant experience)",
      "good": "What makes a good answer (clear structure, relevant but less detailed)",
      "poor": "What makes a poor answer (vague, irrelevant, negative about others)"
    }
  }
]

IMPORTANT:
- Include 2-3 redFlagAnswers for each question showing what NOT to say
- Include 2 followUpQuestions that interviewers commonly ask as follow-ups
- For behavioral questions, always include a starTemplate with prompts
- The scoringRubric should help candidates self-evaluate their answers`;

    const result = await executeJsonArrayCompletion<Question>(
      {
        systemPrompt,
        userPrompt,
        temperature: 0.7,
        maxTokens: 6000,
      },
      {
        userId: req.user!.id,
        operation: 'interview_questions',
      }
    );

    await deductAICredit(req.user!.id, req);

    sendSuccess(res, {
      questions: result.data,
      jobTitle,
      company,
    });
  } catch (error: any) {
    console.error('Interview question generation error:', error);
    next(error);
  }
};

interface Evaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  improvedAnswer: string;
  feedback: string;
}

export const evaluateAnswer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { question, answer, jobTitle, company } = req.body;

    if (!question || !answer) {
      return sendValidationError(res, 'Question and answer are required');
    }

    const systemPrompt = `You are an HONEST and CRITICAL interview coach. Your job is to help candidates improve by giving them REAL feedback, not feel-good platitudes.

SCORING GUIDELINES (BE STRICT):
- 9-10: Exceptional answer that would impress even demanding interviewers (RARE)
- 7-8: Strong answer with good structure and specific examples
- 5-6: Adequate answer but missing key elements or specificity
- 3-4: Weak answer with vague responses or missing the point
- 1-2: Poor answer that would likely disqualify the candidate

Most practice answers should score 4-6. A score of 8+ should be reserved for genuinely impressive responses.`;

    const userPrompt = `Evaluate this interview answer CRITICALLY and HONESTLY:

Position: ${jobTitle || 'Not specified'}${company ? ` at ${company}` : ''}

Question: "${question}"

Candidate's Answer: "${answer}"

EVALUATION CRITERIA:
- Does it use the STAR method (Situation, Task, Action, Result)?
- Are there SPECIFIC examples with concrete details?
- Are there QUANTIFIED results where appropriate?
- Is it concise and well-structured?
- Does it actually answer the question asked?
- Would this answer differentiate them from other candidates?

Provide evaluation in this JSON format:
{
  "score": (1-10, BE HONEST - most answers are 4-6),
  "strengths": ["genuine strengths only - don't manufacture positives"],
  "improvements": ["specific, actionable improvements needed"],
  "criticalIssues": ["any major problems that would hurt their chances"],
  "improvedAnswer": "A significantly stronger version showing what good looks like",
  "feedback": "Honest overall assessment - tell them what an interviewer would really think",
  "wouldPass": true/false - "Would this answer likely advance them to the next round?"
}`;

    const result = await executeJsonCompletion<Evaluation>(
      {
        systemPrompt,
        userPrompt,
        temperature: 0.6,
        maxTokens: 1000,
      },
      {
        userId: req.user!.id,
        operation: 'answer_evaluation',
      }
    );

    await deductAICredit(req.user!.id, req);

    sendSuccess(res, result.data);
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

    sendSuccess(res, {
      questions,
      categories: Object.keys(commonQuestions),
    });
  } catch (error: any) {
    next(error);
  }
};
