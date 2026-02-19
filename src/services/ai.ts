import OpenAI from 'openai';
import config from '../config';
import { prisma } from '../utils/prisma';
import {
  ParsedResumeData,
  JobData,
  ATSAnalysis,
  CustomizationResult,
  TruthGuardWarning,
  CoverLetterInput,
} from '../types';
import { AIServiceError } from '../utils/errors';
import { trackAIUsage } from '../middleware/subscription';

// Initialize OpenAI client
const openai = config.ai.openaiApiKey ? new OpenAI({ apiKey: config.ai.openaiApiKey }) : null;

// Get active prompts from database or use defaults
async function getPrompt(name: string): Promise<string> {
  const prompt = await prisma.promptVersion.findFirst({
    where: { name, isActive: true },
    orderBy: { version: 'desc' },
  });

  return prompt?.promptText || getDefaultPrompt(name);
}

// Default prompts
function getDefaultPrompt(name: string): string {
  const prompts: Record<string, string> = {
    job_analysis: `You are an expert job description analyst. Extract ACCURATE, SPECIFIC information from this job posting.

CRITICAL RULES:
1. Only extract skills/qualifications EXPLICITLY mentioned - do not infer or add common ones
2. Distinguish between REQUIRED (must-have) and PREFERRED (nice-to-have) carefully
3. Extract EXACT keywords as written - these matter for ATS matching
4. If something is unclear or not mentioned, leave the array empty rather than guessing
5. Pay attention to years of experience requirements - this is often a hard filter
6. SEPARATE domain-specific hard skills from generic soft skills — this is critical for accurate scoring

KEYWORD CLASSIFICATION:
- "keywords" = domain-specific technical skills, tools, platforms, methodologies that are unique to this field (e.g. for marketing: SEO, PPC, Google Analytics, Mailchimp; for engineering: React, Kubernetes, CI/CD; for finance: DCF, GAAP, Bloomberg)
- Generic soft skills like "communication", "teamwork", "analytical thinking", "project management", "problem solving" are NOT domain keywords — do NOT include them in keywords array
- The "keywords" array is used for ATS keyword matching — only include skills where the absence would immediately disqualify a candidate

Job Description:
{job_description}

Return a JSON object:
{
  "jobField": "The primary field/industry of this role (e.g. 'digital marketing', 'software engineering', 'data science', 'healthcare', 'finance', 'sales')",
  "requiredSkills": ["ONLY skills explicitly marked as required or must-have"],
  "preferredSkills": ["Skills marked as preferred, nice-to-have, or bonus"],
  "responsibilities": ["Key job duties - be specific, not generic"],
  "keywords": ["Domain-specific hard skills and tools ONLY — no generic soft skills"],
  "qualifications": ["Degree requirements, certifications, years of experience"],
  "companyInfo": "Brief company/role context if mentioned"
}

Return only valid JSON, no markdown.`,

    resume_customize: `You are a world-class resume strategist and ATS optimization expert. Tailor this resume to maximise its match for a specific job while maintaining 100% factual accuracy.

ABSOLUTE RULES — VIOLATION MEANS FAILURE:
1. NEVER fabricate skills, experience, or qualifications not in the original
2. NEVER add fake projects, achievements, or metrics
3. NEVER claim expertise in tools not demonstrated in the original
4. PRESERVE ALL CONTENT — do not remove, shorten, or omit any section or bullet point
5. If the candidate lacks a required skill, put it in missingKeywords — do NOT invent it
6. matchStrength MUST be honest — do not inflate a weak match

METRIC PRESERVATION — ABSOLUTE REQUIREMENT:
Before writing the tailored version, extract every number, percentage, dollar amount, ratio, headcount, and team size from the original resume. Every single one MUST appear verbatim in the tailored version. You may rephrase surrounding words but NEVER drop, round, or replace a metric with a vague word.
FORBIDDEN PATTERNS (apply to any resume):
- Any "%", "$", "×", "x" value → NEVER replace with "significant", "substantial", "notable", "improved"
- Any headcount ("10-person team", "team of 50") → NEVER replace with "large team" or "cross-functional team"
- Any count ("200+ clients", "500K users") → NEVER replace with "many clients" or "large user base"
- Any dollar amount ("$1.2M budget") → NEVER replace with "multi-million dollar" or "large budget"
RULE: If a metric does not fit naturally in a rephrased sentence, keep the original sentence word-for-word rather than dropping the number.

WHAT YOU MUST DO:
- Reorder bullet points so the most job-relevant achievements come first
- Rephrase descriptions to incorporate exact job keywords naturally and truthfully
- Write a sharper summary targeting this exact role and company
- Surface transferable skills only where genuinely applicable
- List EVERY missing required keyword so the candidate knows their real gaps

Original Resume Data:
{resume_data}

Target Job Information:
{job_data}

Job Title: {job_title}
Company: {company_name}

Return a JSON object with ALL fields:
- tailoredData: complete modified resume (same structure, ALL sections preserved)
- changesExplanation: honest explanation of what changed and how strong the match is
- matchStrength: "strong" | "moderate" | "weak" | "poor" — honest, no inflation
- matchedKeywords: job keywords genuinely found in the original resume
- missingKeywords: ALL required/preferred keywords the candidate lacks — be exhaustive

Return only valid JSON, no markdown.`,

    ats_analysis: `You are an AGGRESSIVE, HIGHLY CRITICAL ATS (Applicant Tracking System) analyzer. Provide BRUTALLY HONEST scores and EXTREMELY DETAILED, ACTIONABLE recommendations.

Resume:
{resume_text}

Job Keywords:
{job_keywords}

CRITICAL SCORING RULES - FOLLOW EXACTLY:
1. INCOMPLETE RESUME DETECTION: If sections contain actual placeholder text ("Lorem ipsum", "Dolor sit amet", "[Company Name]", "[Your Name]", "[Add description here]"), mark that section as incomplete and score it 0-15. Generic-sounding but real company names are NOT placeholders — only flag text that is literally a template placeholder
2. KEYWORD MATCHING IS MATHEMATICAL: If job requires 20 keywords and resume has 8, that's 40% - NOT 70%+. Count actual keyword presence, not approximations.
3. DOMAIN/FIELD MISMATCH = SEVERE PENALTY: First, identify the primary field of the job (e.g. digital marketing, software engineering, healthcare, finance, sales). Then identify the primary field of the resume. If they are fundamentally different fields with no meaningful overlap, the score CANNOT exceed 30, regardless of any soft-skill matches. A software engineer applying to a marketing role, a nurse applying to an accounting role, a designer applying to a data science role — these are domain mismatches. Shared soft skills like "communication", "analytics", "project management", or "data-driven thinking" do NOT count as keyword matches when there is a domain mismatch.
4. MISSING KEYWORDS = MAJOR PENALTY: Each missing required skill drops the score significantly
5. VAGUE CONTENT = LOW SCORE: Generic phrases like "team player" or "hard worker" without specifics score poorly
6. NO METRICS = PENALTY: Bullet points without numbers/percentages/results are weak
7. IRRELEVANT EXPERIENCE = DOES NOT COUNT: Don't give credit for unrelated skills
8. SHORT/THIN RESUMES score LOW: A resume with minimal content cannot score high
9. EVALUATE ALL SECTIONS: Score must account for experience, education, skills, certifications, projects, volunteer work, awards, AND languages — do not ignore sections that appear after skills
10. LABELLED URLS ARE NOT RISKY: Lines like "LinkedIn: linkedin.com/in/user" or "GitHub: github.com/user" are correctly formatted for ATS. Do NOT flag these as special character issues. Only flag URLs embedded inside pipe-separated strings or inside bullet points without labels

SCORE GUIDELINES (BE STRICT):
- 90-100: Near-perfect keyword match, quantified achievements, directly relevant experience (RARE)
- 75-89: Strong match with most keywords, good metrics, relevant background
- 60-74: Moderate match, some relevant keywords, lacks quantification
- 40-59: Weak match, missing many keywords, vague descriptions
- 20-39: Poor match, mostly irrelevant content or domain mismatch
- 0-19: Essentially no match — different field entirely

A resume missing 50%+ of required skills should score BELOW 50.
A resume from a completely different field/domain should score BELOW 30.

CRITICAL: You MUST provide ALL fields below. Do NOT skip quickWins, actionPlan, or detailedRecommendations - they are REQUIRED.

Provide a detailed analysis as JSON (ALL FIELDS REQUIRED):
{
  "score": 0-100 (BE HONEST - most resumes score 40-70, not 80+),
  "keywordMatchPercentage": ACTUAL percentage calculated mathematically,
  "matchedKeywords": [...keywords ACTUALLY found - must exist verbatim or as clear synonyms],
  "missingKeywords": [...keywords NOT in resume - be thorough],
  "sectionScores": {
    "summary": 0-100 (0 if missing, 20-40 if generic/vague with no keywords, 60+ if specific with relevant keywords),
    "experience": 0-100 (penalize lack of metrics and irrelevant roles; reward quantified achievements and keyword-rich bullets),
    "skills": 0-100 (only count RELEVANT skills that match job requirements; missing critical skills = low score),
    "education": 0-100 (based on job requirements match),
    "formatting": 0-100 (structure, readability, ATS-friendliness)
  },
  "formattingIssues": [...any formatting problems with specific line/section references],
  "recommendations": [
    "CRITICAL - [SPECIFIC SECTION]: [EXACT PROBLEM]. FIX: [DETAILED SOLUTION WITH EXAMPLE]. IMPACT: +X points. EXAMPLE: 'Change [current text] to [improved version with metrics/keywords]'",
    "HIGH PRIORITY - Add missing keyword '[KEYWORD]' to [SPECIFIC SECTION]. SUGGESTION: '[Exact sentence showing how to naturally incorporate this keyword]'. This keyword appears in X% of successful applications.",
    "URGENT - [SECTION] lacks quantifiable metrics. ADD: Specific numbers, percentages, dollar amounts, team sizes, user counts. BEFORE: '[vague bullet]' AFTER: '[quantified version]' (+5-10 points)",
    "IMMEDIATE - Missing [X] critical keywords: [list]. These appear in 80%+ of accepted resumes. Add to: [specific sections with exact placement suggestions]",
    "REQUIRED - Strengthen [SECTION] by: [3-5 specific, numbered steps with examples]. Current score: X/100, Target: Y/100",
    ... (minimum 10-15 SPECIFIC recommendations, prioritized by impact)
  ],
  "detailedRecommendations": {
    "criticalIssues": [
      {
        "issue": "Specific critical issue found in THIS resume",
        "location": "Exact section and position (e.g. 'Experience - [Company Name], bullet 2')",
        "currentText": "The exact current text from the resume",
        "suggestedText": "The exact improved replacement text with job keywords naturally incorporated",
        "reasoning": "Why this is hurting the ATS score and recruiter appeal",
        "estimatedScoreImpact": "+X points",
        "priority": "CRITICAL|HIGH|MEDIUM",
        "keywords": ["keywords being added"],
        "implementation": "Step-by-step instructions to make this specific change"
      }
    ],
    "missingKeywordDetails": [
      {
        "keyword": "Specific missing keyword",
        "importance": "CRITICAL|HIGH|MEDIUM - appears in X% of job postings",
        "suggestedLocation": "Which section to add it to",
        "exampleUsage": "Exact sentence showing natural incorporation",
        "relatedKeywords": ["synonyms or related terms to also include"],
        "currentGap": "Why this is missing and what it costs"
      }
    ],
    "sectionBySection": {
      "summary": {
        "currentScore": 0-100,
        "issues": ["Specific issue 1", "Specific issue 2", ...],
        "improvements": [
          {
            "change": "What to change",
            "before": "Current version",
            "after": "Improved version with keywords",
            "impact": "+X points"
          }
        ]
      },
      "experience": {
        "currentScore": 0-100,
        "issues": ["List every weak bullet point with specifics"],
        "improvements": [
          {
            "bulletPoint": "Current bullet",
            "weaknesses": ["No metrics", "Missing keyword X", "Too vague"],
            "enhanced": "Stronger version with [KEYWORD] resulting in [METRIC] improvement for [SCOPE]",
            "impact": "+X points",
            "keywordsAdded": ["list"]
          }
        ]
      },
      "skills": {
        "currentScore": 0-100,
        "matched": ["skills that match job"],
        "missing": ["CRITICAL skills not listed - add these NOW"],
        "irrelevant": ["skills to remove or de-emphasize"],
        "reorder": "Put [these skills] first because they match job requirements"
      }
    }
  },
  "quickWins": [
    "REQUIRED - Minimum 3 items specific to THIS resume. Each must be a concrete 5-minute fix with the exact current text, the exact replacement, and the estimated point impact. Format: 'Change [exact current text] to [exact improved text] in [section] (+X points, <5 min)'"
  ],
  "atsExtractedView": "plain text as an ATS would see it",
  "riskyElements": [
    "SPECIFIC element (e.g., 'Table in Experience section') - ATS will ignore this. SOLUTION: [exact fix]",
    ...
  ],
  "honestAssessment": "A blunt 2-3 sentence assessment of this resume's actual competitiveness WITH specific numbers: 'This resume will be rejected by X% of ATS systems because [reasons]. Missing X critical keywords. Needs [specific improvements].'",
  "competitorComparison": "Compared to top candidates, this resume is [X]% weaker in [areas]. Top resumes have [specific elements this one lacks].",
  "actionPlan": {
    "step1": "REQUIRED - IMMEDIATE (5 min): [Most critical single fix for this specific resume — quote the exact text to change and what to change it to]",
    "step2": "REQUIRED - HIGH PRIORITY (15 min): Add the top 3 missing critical keywords to the resume. Name the exact keywords and which sections to add them to.",
    "step3": "REQUIRED - IMPORTANT (30 min): Quantify any bullet points that currently lack metrics. Specify exactly which bullets need numbers and what kind of metric to add (users, revenue, time saved, % improvement).",
    "estimatedScoreAfterFixes": "REQUIRED - Must show current and projected score: e.g. '52/100 → 74/100'"
  }
}

HARD SCORE CEILING BASED ON MISSING KEYWORDS (NON-NEGOTIABLE):
- Count total required job keywords provided
- Count how many are GENUINELY ABSENT from the resume
- If >70% of required keywords missing → score CANNOT exceed 40, regardless of writing quality
- If >50% of required keywords missing → score CANNOT exceed 55
- If >30% of required keywords missing → score CANNOT exceed 70
- Good formatting or writing quality does NOT override this ceiling
- A well-written resume that lacks critical skills is still a poor match

MANDATORY REQUIREMENTS - FAILURE TO INCLUDE THESE WILL RESULT IN REJECTION:
1. quickWins array: MINIMUM 3 items with exact before/after examples
2. actionPlan object: ALL 4 fields required (step1, step2, step3, estimatedScoreAfterFixes)
3. detailedRecommendations.criticalIssues: MINIMUM 3 items with complete before/after examples
4. detailedRecommendations.missingKeywordDetails: At least 3 missing keywords with exact usage examples
5. recommendations array: MINIMUM 15 specific items

BE EXTREMELY SPECIFIC. Every recommendation must include:
1. EXACT location (which section/bullet)
2. CURRENT problematic text (quote it)
3. IMPROVED version (write it out completely)
4. KEYWORDS being added
5. ESTIMATED point impact
6. WHY it matters

If ANY of the required fields (quickWins, actionPlan, detailedRecommendations) are missing or incomplete, the response is INVALID.

Return only valid JSON with ALL required fields populated.`,

    truth_guard: `Compare these two resumes. The tailored version was created by AI from the original.

Original Resume:
{original_data}

Tailored Resume:
{tailored_data}

YOUR TASK — TWO CHECKS ONLY:

CHECK 1 — INVENTED CONTENT:
Read each skill, tool, certification, job title, and project in the TAILORED resume.
Find any item that does NOT exist anywhere in the ORIGINAL resume.
These are fabrications — the AI invented them.

CHECK 2 — INFLATED NUMBERS:
Find any number (dollar amount, percentage, count, ratio) in the TAILORED resume where the ORIGINAL has a SMALLER number for the same claim.
Example: original "20%" → tailored "45%" = inflation. Flag it.
Example: original "20%" → tailored "20%" = unchanged. Do NOT flag it.

THAT IS ALL. Do not check for anything else.
Do NOT flag: simplified descriptions, condensed bullet points, omitted details, missing evidence, missing context, shorter project descriptions, missing certification dates, or anything that was REMOVED from the tailored version. Removal is not your concern.

For each issue found, quote the ORIGINAL text verbatim in the "original" field.

Return JSON array (empty array = AI was faithful, which is the best outcome):
[
  {
    "type": "fabrication|inflation",
    "section": "section name",
    "original": "exact quote from original resume, or 'Not in original' if completely invented",
    "tailored": "exact quote from tailored resume",
    "concern": "one sentence: what was invented or what number was inflated",
    "severity": "high|medium|low",
    "recommendation": "how to fix"
  }
]

Return only valid JSON.`,

    cover_letter: `Write a professional cover letter for this job application.

Candidate Resume:
{resume_data}

Job Information:
{job_data}

Job Title: {job_title}
Company: {company_name}
Tone: {tone}

CRITICAL RULES:
1. ONLY reference experiences, skills, and achievements that exist in the resume
2. NEVER claim expertise in tools/technologies not demonstrated in the resume
3. NEVER fabricate metrics, team sizes, or project outcomes
4. If the candidate is underqualified, focus on genuine transferable skills and learning ability
5. Be honest about experience level - don't claim senior expertise if resume shows junior experience

GUIDELINES:
1. Opening: Express genuine interest (but don't oversell fit if resume doesn't support it)
2. Body: Connect 2-3 REAL experiences from the resume to job requirements
3. Use ACTUAL metrics and achievements from the resume
4. If candidate lacks a key requirement, acknowledge eagerness to learn rather than claiming expertise
5. Closing: Express enthusiasm and call to action
6. Keep it concise: 3-4 paragraphs max

HONESTY CHECK: If the candidate's resume doesn't strongly match the job requirements, the cover letter should still be compelling but realistic. Overselling leads to awkward interviews.

Return only the cover letter text, no JSON or formatting markers.`,
  };

  return prompts[name] || '';
}

// Call AI provider
// Operations that are analytical/scoring — need near-zero temperature for consistency
const DETERMINISTIC_OPERATIONS = new Set([
  'ats_analysis', 'truth_guard', 'job_analysis', 'job_match_score', 'weakness_detector',
]);

async function callAI(
  prompt: string,
  userId: string,
  organizationId: string | null | undefined,
  operation: string,
  maxTokens: number = 4096
): Promise<{ content: string; promptTokens: number; completionTokens: number }> {
  const startTime = Date.now();

  // Scoring/analysis operations use temperature 0.1 for reproducibility.
  // Creative operations (customization, cover letter, writing) use 0.3 for variety.
  const temperature = DETERMINISTIC_OPERATIONS.has(operation) ? 0.1 : 0.3;

  try {
    if (!openai) {
      throw new AIServiceError('OpenAI API key not configured');
    }

    const response = await openai.chat.completions.create({
      model: config.ai.openaiModel,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
    });

    const result = {
      content: response.choices[0]?.message?.content || '',
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
    };

    const durationMs = Date.now() - startTime;

    // Track usage
    await trackAIUsage(
      userId,
      organizationId,
      operation,
      'openai',
      config.ai.openaiModel,
      result.promptTokens,
      result.completionTokens,
      durationMs,
      true
    );

    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;

    await trackAIUsage(
      userId,
      organizationId,
      operation,
      'openai',
      config.ai.openaiModel,
      0,
      0,
      durationMs,
      false,
      (error as Error).message
    );

    throw new AIServiceError(`AI service error: ${(error as Error).message}`);
  }
}

// Parse JSON from AI response (handles markdown code blocks)
function parseAIJSON<T>(content: string): T {
  // Remove markdown code blocks if present
  let cleaned = content.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // Extract JSON object or array from response (handle extra text before/after)
  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    cleaned = jsonMatch[1];
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // If JSON is truncated (max_tokens hit), find the last valid closing brace/bracket
    // and attempt to close the JSON structure minimally.
    const isArray = cleaned.trimStart().startsWith('[');
    const closeChar = isArray ? ']' : '}';
    // Walk back from the end to find a position where we can close cleanly
    for (let i = cleaned.length - 1; i > 0; i--) {
      const ch = cleaned[i];
      if (ch === ',' || ch === ':' || ch === '"' || ch === ' ' || ch === '\n') continue;
      const candidate = cleaned.slice(0, i + 1) + '\n' + closeChar;
      try {
        return JSON.parse(candidate) as T;
      } catch {
        // keep walking back
      }
    }
    // Give up — rethrow original error with context
    throw new Error(`Failed to parse AI JSON response (length ${cleaned.length}): ${cleaned.slice(0, 200)}…`);
  }
}

// Analyze job description
export async function analyzeJobDescription(
  jobDescription: string,
  userId: string,
  organizationId?: string | null
): Promise<JobData> {
  const promptTemplate = await getPrompt('job_analysis');
  const prompt = promptTemplate.replace('{job_description}', jobDescription);

  const { content } = await callAI(prompt, userId, organizationId, 'job_analysis', 1500);

  return parseAIJSON<JobData>(content);
}

// Before/After comparison for resume sections
export interface BeforeAfterComparison {
  section: string;
  before: string;
  after: string;
  improvement: string;
  impactLevel: 'High' | 'Medium' | 'Low';
}

// Customize resume for job
export async function customizeResume(
  resumeData: ParsedResumeData,
  resumeText: string,
  jobData: JobData,
  jobTitle: string,
  companyName: string,
  userId: string,
  organizationId?: string | null,
  jobDescription?: string
): Promise<Omit<CustomizationResult, 'atsScore' | 'atsDetails' | 'truthGuardWarnings'>> {
  // Build the inline prompt directly (mirrors getDefaultPrompt('resume_customize') pattern
  // but includes the runtime variables and the full schema for all resume sections)
  const prompt = `You are a world-class resume strategist and ATS optimization expert. Your task is to tailor this resume to maximise its match for a specific job posting while maintaining 100% factual accuracy.

BEFORE YOU BEGIN — EXTRACT ALL METRICS:
Scan the original resume and list every number, percentage, dollar amount, ratio, headcount, and count you find. You must include every single one verbatim in the tailored version. If a metric does not fit in a rephrased sentence, keep the original sentence unchanged.

ABSOLUTE RULES — VIOLATION MEANS FAILURE:
1. PRESERVE ALL CONTENT — Do NOT remove, shorten, or omit any section, role, or bullet point
2. Include EVERY job position with ALL original bullet points (rephrase only, never delete)
3. Include ALL skills, certifications, projects, volunteer work, awards, and languages
4. REORDER items to surface the most relevant experience first within each section
5. REPHRASE bullet points to incorporate job keywords naturally and truthfully
6. Write a sharper, keyword-rich summary targeting this exact role and company
7. NEVER fabricate, exaggerate, or add anything not present in the original resume
8. If a required skill is genuinely absent, put it in missingKeywords — do NOT invent it
9. Be brutally honest about the match quality in matchStrength and changesExplanation
10. YOUR JOB IS ADDITIVE — add keywords, strengthen verbs, improve framing. Never remove or water down existing facts to make room for keywords
11. DOMAIN MISMATCH DETECTION — If the resume is from a completely different field than the job (e.g. software engineer applying to a marketing role, nurse applying to a finance role), set matchStrength to "poor" and clearly explain the domain mismatch in changesExplanation. Generic skills like "communication" or "analytics" do NOT bridge a domain gap.

METRIC PRESERVATION — NON-NEGOTIABLE:
Before writing the tailored version, identify every number, percentage, dollar amount, ratio, headcount, and team size in the original resume. Every single one MUST appear verbatim in the tailored version.
FORBIDDEN substitutions (applies to any resume):
- Any "%" or "×" value → NEVER replace with "significant", "substantial", "notable", or "improved"
- Any headcount (e.g. "team of 12", "15-person team") → NEVER replace with "large team" or "cross-functional team"
- Any count (e.g. "500+ clients", "2M users") → NEVER replace with "many clients" or "large user base"
- Any dollar amount (e.g. "$800K budget") → NEVER replace with "large budget" or "multi-million dollar"
- Any timeframe or unit attached to a metric → NEVER drop it (e.g. "/year", "/quarter", "per month")
RULE: If a metric cannot fit naturally in a rephrased sentence, keep the entire original sentence unchanged.

ORIGINAL RESUME (full text):
${resumeText}

TARGET JOB:
- Position: ${jobTitle}
- Company: ${companyName}
- Required Skills: ${jobData.requiredSkills?.join(', ') || 'Not specified'}
- Preferred Skills: ${jobData.preferredSkills?.join(', ') || 'Not specified'}
- Key Responsibilities: ${jobData.responsibilities?.slice(0, 6).join('; ') || 'Not specified'}
- Critical Keywords: ${jobData.keywords?.join(', ') || 'Not specified'}
- Qualifications: ${jobData.qualifications?.join(', ') || 'Not specified'}
${jobDescription ? `
FULL JOB DESCRIPTION (use this for context, tone, company culture, and any details not captured above):
${jobDescription}
` : ''}
Return a JSON object with ALL fields below — do NOT omit any section:

{
  "tailoredData": {
    "contact": {
      "name": "exact name from resume",
      "email": "exact email from resume",
      "phone": "exact phone from resume",
      "location": "exact location from resume",
      "linkedin": "linkedin if present",
      "github": "github if present",
      "website": "website if present"
    },
    "summary": "2-3 sentence summary tailored for ${jobTitle} at ${companyName}, using job keywords, highlighting strongest matching experience and concrete impact numbers",
    "experience": [
      {
        "title": "exact title from resume",
        "company": "exact company",
        "location": "location",
        "startDate": "start date",
        "endDate": "end date or empty if current",
        "current": true,
        "description": ["ALL original bullets rephrased to include job keywords naturally. Do not drop any bullet."]
      }
    ],
    "education": [
      {
        "degree": "degree",
        "institution": "institution",
        "location": "location if present",
        "graduationDate": "date",
        "gpa": "gpa if present",
        "achievements": ["honours, thesis, TA roles, competitions"]
      }
    ],
    "skills": ["ALL skills from resume, reordered — most relevant to ${jobTitle} first"],
    "certifications": ["ALL certifications from resume"],
    "projects": [
      {
        "name": "project name",
        "description": "description rephrased to highlight relevance to ${jobTitle}",
        "technologies": ["tech stack"],
        "url": "url if present"
      }
    ],
    "volunteerWork": [
      {
        "role": "role",
        "organization": "org",
        "location": "location if present",
        "startDate": "start",
        "endDate": "end or empty",
        "current": false,
        "description": ["all bullets"]
      }
    ],
    "awards": ["ALL awards from resume as strings"],
    "languages": ["ALL languages from resume"]
  },
  "changesExplanation": "Honest explanation: what was reordered/rephrased, how strong the match is, and what the biggest gaps are",
  "matchStrength": "strong|moderate|weak|poor — HONEST assessment based on keyword coverage and experience alignment",
  "matchedKeywords": ["job keywords genuinely present in the original resume"],
  "missingKeywords": ["required/preferred job keywords NOT present in the original — be exhaustive"],
  "beforeAfterComparisons": [
    {
      "section": "Summary|Experience - Company Name|Skills",
      "before": "original text",
      "after": "optimised text with keywords",
      "improvement": "why this change improves ATS score and recruiter appeal",
      "impactLevel": "High|Medium|Low"
    }
  ],
  "keywordDensity": {
    "before": 0,
    "after": 0,
    "improvement": "+X keywords added naturally"
  },
  "optimizationSummary": {
    "sectionsOptimized": 0,
    "keywordsAdded": 0,
    "bulletPointsEnhanced": 0,
    "estimatedATSImprovement": "+X%"
  }
}

REQUIREMENTS:
- experience must include EVERY position with ALL bullet points — no truncation
- missingKeywords must be exhaustive — list every required skill the candidate lacks
- matchStrength must be honest — do not inflate if the match is weak or poor
- Include at least 5 beforeAfterComparisons for the highest-impact changes

Return only valid JSON, no markdown.`;

  // Use higher token limit for comprehensive resume output
  const { content } = await callAI(prompt, userId, organizationId, 'resume_customize', 8192);

  const result = parseAIJSON<{
    tailoredData: ParsedResumeData;
    changesExplanation: string;
    matchStrength: 'strong' | 'moderate' | 'weak' | 'poor';
    matchedKeywords: string[];
    missingKeywords: string[];
    beforeAfterComparisons?: BeforeAfterComparison[];
    keywordDensity?: {
      before: number;
      after: number;
      improvement: string;
    };
    optimizationSummary?: {
      sectionsOptimized: number;
      keywordsAdded: number;
      bulletPointsEnhanced: number;
      estimatedATSImprovement: string;
    };
  }>(content);

  // CRITICAL FIX: Preserve original contact information
  // AI sometimes returns placeholder data like "John Doe" - override with actual user data
  result.tailoredData.contact = {
    ...result.tailoredData.contact,
    ...resumeData.contact, // Override with original contact info
  };

  // Generate tailored text from data
  const tailoredText = generateResumeText(result.tailoredData);

  return {
    tailoredData: result.tailoredData,
    tailoredText,
    changesExplanation: result.changesExplanation,
    matchStrength: result.matchStrength,
    matchedKeywords: result.matchedKeywords,
    missingKeywords: result.missingKeywords,
    beforeAfterComparisons: result.beforeAfterComparisons || [],
    keywordDensity: result.keywordDensity,
    optimizationSummary: result.optimizationSummary,
  };
}

// Analyze ATS compatibility
export async function analyzeATS(
  resumeText: string,
  jobKeywords: string[],
  userId: string,
  organizationId?: string | null,
  missingKeywords?: string[],
  jobField?: string
): Promise<ATSAnalysis> {
  const promptTemplate = await getPrompt('ats_analysis');
  let prompt = promptTemplate
    .replace('{resume_text}', resumeText)
    .replace('{job_keywords}', JSON.stringify(jobKeywords));

  // Inject job field so ATS can detect domain mismatch
  if (jobField) {
    prompt += `\n\nJOB FIELD: ${jobField}
Apply the DOMAIN/FIELD MISMATCH rule (Rule 3): if the resume's primary field is fundamentally different from "${jobField}", cap the score at 30 and explain the domain mismatch in honestAssessment.`;
  }

  // Fix 3: Inject confirmed missing keywords so scorer cannot ignore real gaps
  if (missingKeywords && missingKeywords.length > 0) {
    const missingPct = Math.round((missingKeywords.length / Math.max(jobKeywords.length, 1)) * 100);
    prompt += `\n\nCRITICAL VERIFIED DATA — DO NOT IGNORE:
The following ${missingKeywords.length} required keywords are CONFIRMED ABSENT from this resume (${missingPct}% of total required keywords missing):
${missingKeywords.join(', ')}

This is a HARD FACT verified before scoring. Each missing required keyword is a mandatory deduction.
Apply the keyword ceiling rule: ${missingPct}% missing → score ceiling is ${
  missingPct > 70 ? '40' : missingPct > 50 ? '55' : missingPct > 30 ? '70' : '100'
} maximum.
Do NOT award points for keywords that appear in the confirmed-missing list above.`;
  }

  const { content } = await callAI(prompt, userId, organizationId, 'ats_analysis', 6000);

  return parseAIJSON<ATSAnalysis>(content);
}

// Run Truth Guard check
export async function runTruthGuard(
  originalData: ParsedResumeData,
  tailoredData: ParsedResumeData,
  userId: string,
  organizationId?: string | null
): Promise<TruthGuardWarning[]> {
  const promptTemplate = await getPrompt('truth_guard');
  const prompt = promptTemplate
    .replace('{original_data}', JSON.stringify(originalData, null, 2))
    .replace('{tailored_data}', JSON.stringify(tailoredData, null, 2));

  const { content } = await callAI(prompt, userId, organizationId, 'truth_guard', 2000);

  const warnings = parseAIJSON<TruthGuardWarning[]>(content);

  // Filter out omission-based warnings — the AI was trained to flag "missing details"
  // but our Truth Guard should only surface fabrications and inflations.
  const OMISSION_PATTERNS = [
    // Explicit omission language
    /omit/i,
    /does not (mention|specify|include|provide|state)/i,
    /without (specifying|mentioning|providing|stating|detailing|the)/i,
    /not (mentioned|specified|included|provided|stated)/i,
    // "lacks X" — e.g. "lacks the specificity", "lacks details", "lacks evidence"
    /lacks/i,
    // Missing/absent details
    /missing/i,
    /does not provide evidence/i,
    // Mislead/misrepresent — caused by simplification, not fabrication
    /mislead/i,
    /misrepresent/i,
    /downplay/i,
    // Specificity/detail loss
    /not.*detail/i, /no.*detail/i,
    /without.*number/i, /without.*date/i, /without.*metric/i,
    /simplif/i,          // "simplifies", "simplified"
    /understate/i,
    /does not specify/i,
    /no longer (mention|state|include)/i,
    /less specific/i, /less (detailed|impactful|precise)/i,
    /more generic/i, /more vague/i,
    /than the original/i,   // "less X than the original claim"
  ];
  const OMISSION_TYPES = new Set(['inconsistency', 'unsupported_claim', 'exaggeration']);

  return warnings.filter(w => {
    // Always keep genuine fabrication type
    if (w.type === 'fabrication') return true;
    // Keep inflation if it's about a number being made larger
    if (w.type === 'inflation') return true;
    // For other types, drop if concern language is about omissions
    const concernText = w.concern || '';
    const isAboutOmission = OMISSION_PATTERNS.some(pattern => pattern.test(concernText));
    if (isAboutOmission && OMISSION_TYPES.has(w.type)) return false;
    return true;
  });
}

// Enhanced cover letter result
export interface EnhancedCoverLetterResult {
  content: string;
  alternativeOpenings: {
    style: 'story' | 'achievement' | 'connection' | 'passion';
    opening: string;
    description: string;
  }[];
  keyPhrases: {
    phrase: string;
    matchesJobRequirement: string;
  }[];
  toneAnalysis: {
    currentTone: string;
    formalityScore: number; // 1-10
    enthusiasmScore: number; // 1-10
    suggestions: string[];
  };
  callToActionVariations: string[];
  subjectLineOptions: string[];
}

// Generate cover letter
export async function generateCoverLetter(
  input: CoverLetterInput,
  userId: string,
  organizationId?: string | null
): Promise<string> {
  const prompt = `Write a professional cover letter for this job application.

Candidate Resume:
${JSON.stringify(input.resumeData, null, 2)}

Job Information:
${JSON.stringify(input.jobData, null, 2)}

Job Title: ${input.jobTitle}
Company: ${input.companyName}
Tone: ${input.tone || 'professional'}

Guidelines:
1. Opening: Express genuine interest in the role
2. Body: Connect 2-3 specific experiences/skills to job requirements
3. Use concrete examples from the resume
4. Show knowledge of the company (if info available)
5. Closing: Express enthusiasm and call to action
6. Keep it concise: 3-4 paragraphs max
7. NEVER fabricate experience or skills

Return only the cover letter text, no JSON or formatting markers.`;

  const { content } = await callAI(prompt, userId, organizationId, 'cover_letter');

  return content.trim();
}

// Generate enhanced cover letter with alternatives
export async function generateEnhancedCoverLetter(
  input: CoverLetterInput,
  userId: string,
  organizationId?: string | null
): Promise<EnhancedCoverLetterResult> {
  const prompt = `Write a professional cover letter for this job application AND provide alternative options.

Candidate Resume:
${JSON.stringify(input.resumeData, null, 2)}

Job Information:
${JSON.stringify(input.jobData, null, 2)}

Job Title: ${input.jobTitle}
Company: ${input.companyName}
Tone: ${input.tone || 'professional'}

Guidelines:
1. Opening: Express genuine interest in the role
2. Body: Connect 2-3 specific experiences/skills to job requirements
3. Use concrete examples from the resume
4. Show knowledge of the company (if info available)
5. Closing: Express enthusiasm and call to action
6. Keep it concise: 3-4 paragraphs max
7. NEVER fabricate experience or skills

Return JSON:
{
  "content": "The full cover letter text (3-4 paragraphs)",
  "alternativeOpenings": [
    {
      "style": "story",
      "opening": "A compelling story-based opening paragraph that hooks the reader",
      "description": "Opens with a brief professional story or anecdote"
    },
    {
      "style": "achievement",
      "opening": "An achievement-focused opening that leads with impact",
      "description": "Opens by highlighting a key accomplishment relevant to the role"
    },
    {
      "style": "connection",
      "opening": "A connection-based opening referencing mutual contacts or company knowledge",
      "description": "Opens by establishing a personal or professional connection"
    },
    {
      "style": "passion",
      "opening": "A passion-driven opening showing enthusiasm for the field/company",
      "description": "Opens by expressing genuine passion for the work"
    }
  ],
  "keyPhrases": [
    {
      "phrase": "Key phrase used in the cover letter",
      "matchesJobRequirement": "Which job requirement this addresses"
    }
  ],
  "toneAnalysis": {
    "currentTone": "Description of the letter's tone (e.g., 'Confident and professional')",
    "formalityScore": 7,
    "enthusiasmScore": 8,
    "suggestions": ["Suggestions to adjust tone if needed"]
  },
  "callToActionVariations": [
    "I would welcome the opportunity to discuss how my experience can benefit [Company].",
    "I am excited to bring my skills to your team and would love to schedule a conversation.",
    "Let's connect to explore how I can contribute to [Company]'s continued success."
  ],
  "subjectLineOptions": [
    "Application for ${input.jobTitle} - [Your Name]",
    "Experienced [Role] Excited to Join ${input.companyName}",
    "${input.jobTitle} Application - [Relevant Achievement/Skill]"
  ]
}

Return only valid JSON.`;

  const { content } = await callAI(prompt, userId, organizationId, 'cover_letter_enhanced', 4000);

  return parseAIJSON<EnhancedCoverLetterResult>(content);
}

// Generate plain text from structured resume data
function generateResumeText(data: ParsedResumeData): string {
  const lines: string[] = [];

  // Contact — keep URLs on labelled separate lines so ATS parsers don't
  // choke on slash characters embedded in pipe-separated contact strings
  if (data.contact.name) lines.push(data.contact.name);
  const coreContact = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
  ].filter(Boolean);
  if (coreContact.length > 0) lines.push(coreContact.join(' | '));
  if (data.contact.linkedin) lines.push(`LinkedIn: ${data.contact.linkedin}`);
  if (data.contact.github)   lines.push(`GitHub: ${data.contact.github}`);
  if (data.contact.website)  lines.push(`Website: ${data.contact.website}`);
  lines.push('');

  // Summary
  if (data.summary) {
    lines.push('SUMMARY');
    lines.push(data.summary);
    lines.push('');
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    lines.push('EXPERIENCE');
    for (const exp of data.experience) {
      const title = exp.title || exp.position || 'Position';
      lines.push(`${title} at ${exp.company}${exp.location ? `, ${exp.location}` : ''}`);
      if (exp.startDate || exp.endDate) {
        lines.push(`${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`);
      }
      const descriptions = exp.description || exp.highlights || [];
      for (const desc of descriptions) {
        lines.push(`• ${desc}`);
      }
      lines.push('');
    }
  }

  // Education
  if (data.education && data.education.length > 0) {
    lines.push('EDUCATION');
    for (const edu of data.education) {
      lines.push(edu.degree);
      if (edu.institution) lines.push(edu.institution);
      if (edu.location) lines.push(edu.location);
      if (edu.graduationDate) lines.push(edu.graduationDate);
      if (edu.gpa) lines.push(`GPA: ${edu.gpa}`);
      if (edu.achievements && edu.achievements.length > 0) {
        for (const ach of edu.achievements) lines.push(`• ${ach}`);
      }
      lines.push('');
    }
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    lines.push('SKILLS');
    lines.push(data.skills.join(', '));
    lines.push('');
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    lines.push('CERTIFICATIONS');
    for (const cert of data.certifications) {
      lines.push(`• ${typeof cert === 'string' ? cert : (cert as any).name}`);
    }
    lines.push('');
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    lines.push('PROJECTS');
    for (const project of data.projects) {
      lines.push(project.name);
      if (project.description) lines.push(project.description);
      if (project.technologies && project.technologies.length > 0) {
        lines.push(`Technologies: ${project.technologies.join(', ')}`);
      }
      lines.push('');
    }
  }

  // Volunteer Work — was previously invisible to the ATS analyzer
  if (data.volunteerWork && data.volunteerWork.length > 0) {
    lines.push('VOLUNTEER WORK');
    for (const vol of data.volunteerWork as any[]) {
      if (typeof vol === 'string') { lines.push(`• ${vol}`); continue; }
      lines.push(`${vol.role} at ${vol.organization}${vol.location ? `, ${vol.location}` : ''}`);
      if (vol.startDate) {
        lines.push(`${vol.startDate} - ${vol.current ? 'Present' : vol.endDate || ''}`);
      }
      if (vol.description && vol.description.length > 0) {
        for (const desc of vol.description) lines.push(`• ${desc}`);
      }
      lines.push('');
    }
  }

  // Awards — was previously invisible to the ATS analyzer
  if (data.awards && data.awards.length > 0) {
    lines.push('AWARDS & HONORS');
    for (const award of data.awards as any[]) {
      if (typeof award === 'string') {
        lines.push(`• ${award}`);
      } else {
        const awardLine = [award.title, award.issuer, award.date].filter(Boolean).join(' — ');
        lines.push(`• ${awardLine}`);
        if (award.description) lines.push(`  ${award.description}`);
      }
    }
    lines.push('');
  }

  // Languages — was previously invisible to the ATS analyzer
  if (data.languages && data.languages.length > 0) {
    lines.push('LANGUAGES');
    lines.push(data.languages.join(', '));
    lines.push('');
  }

  return lines.join('\n');
}

// Full resume customization pipeline
export async function fullCustomizationPipeline(
  resumeData: ParsedResumeData,
  resumeText: string,
  jobDescription: string,
  jobTitle: string,
  companyName: string,
  userId: string,
  organizationId?: string | null
): Promise<CustomizationResult> {
  // Step 1: Analyze job description
  const jobData = await analyzeJobDescription(jobDescription, userId, organizationId);

  // Step 2: Customize resume — pass raw JD for full context
  const customization = await customizeResume(
    resumeData,
    resumeText,
    jobData,
    jobTitle,
    companyName,
    userId,
    organizationId,
    jobDescription
  );

  // Step 3: Code-level domain mismatch detection (reliable, not dependent on AI self-assessment)
  // Count how many job required-skills/keywords appear verbatim in the ORIGINAL resume text.
  // If fewer than 15% of domain-specific job keywords actually appear, it's a cross-domain application.
  const jobKeywords = [...jobData.requiredSkills, ...jobData.keywords];
  const resumeTextLower = resumeText.toLowerCase();
  const literalMatches = jobKeywords.filter(kw => kw && resumeTextLower.includes(kw.toLowerCase()));
  const literalMatchRate = jobKeywords.length > 0 ? literalMatches.length / jobKeywords.length : 1;
  const isDomainMismatch = literalMatchRate < 0.15; // < 15% of job keywords appear in original resume

  if (isDomainMismatch) {
    // Force matchStrength to poor before ATS step so ceiling logic applies correctly
    (customization as any).matchStrength = 'poor';
  }

  // Run ATS analysis — pass confirmed missing keywords so scorer cannot ignore real gaps
  const atsDetails = await analyzeATS(
    customization.tailoredText,
    jobKeywords,
    userId,
    organizationId,
    customization.missingKeywords,  // inject verified missing keywords
    jobData.jobField                // domain mismatch hint for prompt
  );

  // Fix 4: Domain mismatch hard cap — applied in code, not left to AI discretion
  if (isDomainMismatch) {
    atsDetails.score = Math.min(atsDetails.score, 25);
    (customization as any).matchStrength = 'poor';
    if (!atsDetails.honestAssessment) {
      atsDetails.honestAssessment =
        `Domain mismatch: your resume background does not align with the core requirements of this ${jobData.jobField ?? 'role'}. ` +
        `Only ${Math.round(literalMatchRate * 100)}% of the job's required skills appear in your resume. ` +
        `Consider applying to roles that match your actual skill set.`;
    }
  }

  // Enforce hard score ceiling based on match strength
  // The LLM optimizes the resume text first, which inflates ATS scores — correct for this
  const matchStrengthCeiling: Record<string, number> = {
    strong: 100,
    moderate: 78,
    weak: 58,
    poor: 30,
  };
  const ceiling = matchStrengthCeiling[customization.matchStrength as string] ?? 100;
  if (atsDetails.score > ceiling) {
    atsDetails.score = ceiling;
  }

  // Also enforce keyword-based ceiling independently
  const totalKeywords = jobKeywords.length;
  const missingCount = customization.missingKeywords.length;
  if (totalKeywords > 0) {
    const missingPct = missingCount / totalKeywords;
    const keywordCeiling =
      missingPct > 0.7 ? 40 :
      missingPct > 0.5 ? 55 :
      missingPct > 0.3 ? 70 : 100;
    if (atsDetails.score > keywordCeiling) {
      atsDetails.score = keywordCeiling;
    }
  }

  // Always reconcile section scores with the overall score.
  // The AI sometimes gives inconsistent results (sections 80/80/60 but overall 20).
  // Compute the implied section average and rescale so they match the overall.
  if (atsDetails.sectionScores) {
    const sectionKeys = Object.keys(atsDetails.sectionScores) as Array<keyof typeof atsDetails.sectionScores>;
    const sectionAvg = sectionKeys.reduce((sum, k) => sum + atsDetails.sectionScores[k], 0) / sectionKeys.length;
    // Only rescale if there is a meaningful gap (>10 pts) between section avg and overall
    if (sectionAvg > 0 && Math.abs(sectionAvg - atsDetails.score) > 10) {
      const scaleFactor = atsDetails.score / sectionAvg;
      sectionKeys.forEach(key => {
        atsDetails.sectionScores[key] = Math.min(100, Math.round(atsDetails.sectionScores[key] * scaleFactor));
      });
    }
  }

  // Step 4: Run Truth Guard
  const truthGuardWarnings = await runTruthGuard(
    resumeData,
    customization.tailoredData,
    userId,
    organizationId
  );

  return {
    ...customization,
    atsScore: atsDetails.score,
    atsDetails,
    truthGuardWarnings,
  };
}

// ============================================================================
// NEW AI FEATURES - Differentiation Features
// ============================================================================

// Job Match Score - Calculate compatibility % before applying
export interface JobMatchResult {
  overallScore: number;
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    keywordsMatch: number;
  };
  strengths: string[];
  gaps: string[];
  verdict: 'Strong Match' | 'Good Match' | 'Moderate Match' | 'Weak Match' | 'Poor Match';
  recommendation: string;
  timeToApply: string;
  dealBreakers?: string[]; // Absolute disqualifiers
}

export async function calculateJobMatchScore(
  resumeData: ParsedResumeData,
  jobDescription: string,
  jobTitle: string,
  userId: string,
  organizationId?: string | null
): Promise<JobMatchResult> {
  const prompt = `You are a BRUTALLY HONEST job matching analyst. Your job is to give REALISTIC scores, not feel-good numbers.

CANDIDATE RESUME:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

JOB TITLE: ${jobTitle}

STRICT SCORING CRITERIA - FOLLOW EXACTLY:

SKILLS MATCH (be mathematical):
- Count required skills in job posting
- Count how many the candidate ACTUALLY has (not "could learn" or "similar to")
- Calculate: (matched / required) * 100
- Transferable skills count at 50% value only
- "Familiar with" or "exposure to" = 25% credit max

EXPERIENCE MATCH:
- If job requires 5 years and candidate has 2, that's a 40% match, NOT 70%
- Irrelevant industry experience counts at 30% value
- Junior applying to Senior role = automatic cap at 50%
- No relevant experience = 0-20% maximum

EDUCATION MATCH:
- Missing required degree = 50% cap unless experience compensates
- Wrong field = 60% cap
- No education listed when required = 20% max

KEYWORDS MATCH:
- Calculate mathematically: (found keywords / total required keywords) * 100
- Generic words don't count ("leadership", "communication" without specifics)
- Must find ACTUAL evidence, not just claims

OVERALL SCORE CALCULATION:
- Weight: Skills 35%, Experience 35%, Education 15%, Keywords 15%
- A FAKE/DUMMY resume with generic info should score 15-30 MAX
- Someone clearly unqualified should score BELOW 40
- Most real candidates score 40-65
- 70+ is genuinely good
- 85+ is exceptional (rare)

Return JSON:
{
  "overallScore": 0-100 (REALISTIC - average should be 45-55, not 70+),
  "breakdown": {
    "skillsMatch": 0-100 (MATHEMATICAL calculation),
    "experienceMatch": 0-100 (years + relevance factored),
    "educationMatch": 0-100 (degree + field alignment),
    "keywordsMatch": 0-100 (actual keywords found)
  },
  "strengths": ["ONLY list genuine strengths backed by evidence - if none, say so"],
  "gaps": ["List ALL significant gaps - be thorough, minimum 3-5 for most candidates"],
  "verdict": "Strong Match" (80+) | "Good Match" (65-79) | "Moderate Match" (45-64) | "Weak Match" (30-44) | "Poor Match" (<30),
  "recommendation": "Blunt, honest advice - tell them if they're wasting time applying",
  "timeToApply": "'Worth applying immediately' (70+) | 'Consider applying with improvements' (50-69) | 'Significant skill building needed' (30-49) | 'Not a fit - look elsewhere' (<30)",
  "dealBreakers": ["List any absolute disqualifiers - missing required certs, years, skills"]
}

YOUR GOAL: Help users by being HONEST. An inflated score that leads to rejection hurts more than an honest low score that helps them improve or target better-fit roles.

Return only valid JSON.`;

  const { content } = await callAI(prompt, userId, organizationId, 'job_match_score', 1500);
  return parseAIJSON<JobMatchResult>(content);
}

// Achievement Quantifier - Convert vague achievements to metrics
export interface QuantifiedAchievement {
  original: string;
  quantified: string;
  addedMetrics: string[];
  impactLevel: 'High' | 'Medium' | 'Low';
  suggestions: string[];
}

export interface AchievementQuantifierResult {
  achievements: QuantifiedAchievement[];
  overallImprovement: string;
  tips: string[];
}

export async function quantifyAchievements(
  bullets: string[],
  jobContext?: string,
  userId?: string,
  organizationId?: string | null
): Promise<AchievementQuantifierResult> {
  const prompt = `You are an expert resume writer. Help quantify achievements while staying HONEST and REALISTIC.

BULLET POINTS TO ENHANCE:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

${jobContext ? `JOB CONTEXT (tailor enhancements for): ${jobContext}` : ''}

CRITICAL RULES - HONESTY FIRST:
1. Use PLACEHOLDER BRACKETS like [X]%, [N]+, [$X] where users MUST fill in their actual numbers
2. NEVER invent specific percentages, dollar amounts, or counts - users must verify these
3. Suggest REALISTIC ranges based on typical outcomes for similar roles
4. If a bullet is too vague to quantify honestly, say so and suggest what info the user needs to provide
5. Don't turn minor tasks into major achievements - keep impact levels honest

REALISTIC METRIC GUIDELINES:
- Most individual contributors don't "increase revenue by millions" - be realistic about scope
- Team sizes are usually 3-10, not 50+ unless it's a director-level role
- Efficiency improvements of 15-30% are realistic; 80%+ is rare and suspicious
- Cost savings should match the scope of the role

Return JSON:
{
  "achievements": [
    {
      "original": "the original bullet point",
      "quantified": "enhanced version with [PLACEHOLDER] metrics user must fill in",
      "addedMetrics": ["list of placeholder metrics added - user must verify"],
      "impactLevel": "High/Medium/Low - be realistic about actual impact",
      "suggestions": ["what specific data the user should look up to fill in placeholders"],
      "warningIfFabricated": "what could go wrong if user uses fake numbers"
    }
  ],
  "overallImprovement": "Summary of improvements with reminder to fill in real numbers",
  "tips": [
    "Always use your actual numbers - interviewers will ask for specifics",
    "If you don't have exact numbers, use conservative estimates you can defend",
    "It's better to have fewer quantified bullets with real data than many with fabricated metrics"
  ],
  "honestAssessment": "Assessment of whether these bullets have enough substance to quantify meaningfully"
}

Example transformation:
- Original: "Improved customer satisfaction"
- Quantified: "Increased customer satisfaction scores by [X]% (from [baseline] to [new score]) through [specific initiative], serving [N]+ monthly customers"
- Note: User must fill in actual metrics from their work records

Return only valid JSON.`;

  const { content } = await callAI(prompt, userId || '', organizationId, 'quantify_achievements');
  return parseAIJSON<AchievementQuantifierResult>(content);
}

// Weakness Detector - Find red flags in resume
export interface ResumeWeakness {
  issue: string;
  location: string;
  severity: 'Critical' | 'Major' | 'Minor';
  impact: string;
  fix: string;
  example?: string;
  // NEW: Full rewritten version
  rewrittenVersion?: string;
  originalText?: string;
}

export interface WeaknessDetectorResult {
  weaknesses: ResumeWeakness[];
  overallHealth: 'Excellent' | 'Good' | 'Needs Work' | 'Critical Issues';
  healthScore: number;
  prioritizedActions: string[];
  positives: string[];
  // NEW: Quick fixes ready to copy-paste
  quickFixes?: {
    section: string;
    original: string;
    improved: string;
    changeType: 'rewrite' | 'add' | 'remove' | 'restructure';
  }[];
  // NEW: Industry-specific feedback
  industryInsights?: {
    commonMistakes: string[];
    industryKeywords: string[];
    competitorAdvantages: string[];
  };
  // Brutally honest assessment
  bluntAssessment?: string;
}

export async function detectWeaknesses(
  resumeData: ParsedResumeData,
  resumeText: string,
  targetRole?: string,
  userId?: string,
  organizationId?: string | null
): Promise<WeaknessDetectorResult> {
  const prompt = `You are an EXTREMELY CRITICAL resume reviewer - think of yourself as a hiring manager who has seen 10,000 resumes and has no patience for mediocrity. Your job is to FIND PROBLEMS, not give compliments.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

RESUME TEXT:
${resumeText}

${targetRole ? `TARGET ROLE: ${targetRole}` : ''}

MANDATORY CHECKS - Find issues in ALL these areas (every resume has problems):

1. CONTENT QUALITY ISSUES:
   - Vague bullet points without metrics (e.g., "Responsible for sales" = WEAK)
   - Duties instead of achievements (what they DID vs what IMPACT they had)
   - No numbers, percentages, dollar amounts, or quantified results
   - Generic descriptions that could apply to anyone
   - Buzzwords without evidence ("results-driven" means nothing without results)

2. STRUCTURAL ISSUES:
   - Missing or weak professional summary
   - Poor bullet point structure (not starting with action verbs)
   - Too short (under-selling) or too long (unfocused)
   - Missing sections (skills, education, etc.)
   - Inconsistent formatting

3. EXPERIENCE RED FLAGS:
   - Employment gaps (any period > 3 months unexplained)
   - Job hopping (multiple roles < 1 year)
   - Lack of career progression
   - Irrelevant experience taking up space
   - Outdated experience (10+ years ago) given too much weight

4. SKILLS & KEYWORDS:
   - Missing industry-standard skills for the target role
   - Skills listed but not demonstrated in experience
   - Outdated technologies or skills
   - No technical skills when expected

5. CREDIBILITY ISSUES:
   - Claims without evidence
   - Exaggerated-sounding achievements
   - Missing dates or vague timeframes
   - No LinkedIn/portfolio when expected

HEALTH SCORE GUIDELINES (BE HARSH):
- 90-100: Near-perfect resume (EXTREMELY RARE - maybe 1 in 100)
- 75-89: Strong resume with minor issues
- 60-74: Decent resume but needs work
- 40-59: Below average, multiple problems
- 20-39: Poor resume, major issues
- 0-19: Unusable, needs complete rewrite

A DUMMY/FAKE resume with generic content should score 15-30 MAX.
Most real resumes score 40-65. An "Excellent" rating should be RARE.

MINIMUM REQUIREMENTS:
- Find AT LEAST 5 weaknesses (every resume has them)
- At least 2 should be "Major" or "Critical" severity
- For dummy/thin content: find 8+ issues and rate as "Critical Issues"

Return JSON:
{
  "weaknesses": [
    {
      "issue": "Specific, clear description of the problem",
      "location": "Exact location in resume",
      "severity": "Critical (deal-breaker) | Major (significant problem) | Minor (improvement opportunity)",
      "impact": "How this SPECIFICALLY hurts their job search",
      "fix": "Concrete, actionable fix with specific guidance",
      "example": "Example of what good looks like",
      "originalText": "The exact weak text",
      "rewrittenVersion": "Complete replacement text they can copy-paste"
    }
  ],
  "overallHealth": "Excellent (85+, rare) | Good (70-84) | Needs Work (50-69) | Critical Issues (<50)",
  "healthScore": 0-100 (BE HONEST - most resumes are 40-65),
  "prioritizedActions": ["Top 5 fixes ranked by impact - be specific"],
  "positives": ["1-2 genuine positives ONLY if they exist - it's OK to have none"],
  "quickFixes": [
    {
      "section": "Section name",
      "original": "Weak original text",
      "improved": "Improved version",
      "changeType": "rewrite|add|remove|restructure"
    }
  ],
  "industryInsights": {
    "commonMistakes": ["Specific mistakes for ${targetRole || 'this role'}"],
    "industryKeywords": ["Missing keywords standard in this field"],
    "competitorAdvantages": ["What winning candidates include that this one lacks"]
  },
  "bluntAssessment": "A 2-3 sentence brutally honest assessment of this resume's competitiveness in today's job market"
}

REMEMBER: Your job is to HELP by being HONEST. Finding no problems helps no one. A resume that seems "fine" at first glance always has issues upon closer inspection.

Return only valid JSON.`;

  const { content } = await callAI(prompt, userId || '', organizationId, 'weakness_detector', 6000);
  return parseAIJSON<WeaknessDetectorResult>(content);
}

// Follow-up Email Generator
export interface FollowUpEmailResult {
  subject: string;
  body: string;
  timing: string;
  tips: string[];
  alternativeSubjects: string[];
}

export type FollowUpType = 'thank_you' | 'post_interview' | 'no_response' | 'after_rejection' | 'networking';

export async function generateFollowUpEmail(
  type: FollowUpType,
  context: {
    recipientName?: string;
    recipientTitle?: string;
    companyName: string;
    jobTitle: string;
    interviewDate?: string;
    interviewDetails?: string;
    candidateName: string;
    keyPoints?: string[];
  },
  userId: string,
  organizationId?: string | null
): Promise<FollowUpEmailResult> {
  const typeInstructions: Record<FollowUpType, string> = {
    thank_you: 'Write a thank you email to send within 24 hours after an interview. Express gratitude, reinforce interest, and reference specific conversation points.',
    post_interview: 'Write a follow-up email for 5-7 days after interview with no response. Politely inquire about status while reinforcing qualifications.',
    no_response: 'Write a gentle follow-up after 2+ weeks of silence. Keep it short and professional, offer to provide additional information.',
    after_rejection: 'Write a gracious response to rejection. Thank them, express continued interest in future opportunities, ask for feedback.',
    networking: 'Write an email to maintain connection after a networking meeting or informational interview.',
  };

  const prompt = `You are an expert at professional communication. ${typeInstructions[type]}

CONTEXT:
- Candidate Name: ${context.candidateName}
- Company: ${context.companyName}
- Position: ${context.jobTitle}
${context.recipientName ? `- Recipient: ${context.recipientName}${context.recipientTitle ? ` (${context.recipientTitle})` : ''}` : ''}
${context.interviewDate ? `- Interview Date: ${context.interviewDate}` : ''}
${context.interviewDetails ? `- Interview Details: ${context.interviewDetails}` : ''}
${context.keyPoints?.length ? `- Key Points to Reference: ${context.keyPoints.join(', ')}` : ''}

Guidelines:
1. Professional but warm tone
2. Concise - 3-4 short paragraphs max
3. Specific to the context (not generic)
4. Clear call to action or next step
5. No desperation or over-apologizing

Return JSON:
{
  "subject": "Email subject line",
  "body": "Full email body with proper greeting and signature placeholder [Your Name]",
  "timing": "When to send this email",
  "tips": ["2-3 tips for sending this email"],
  "alternativeSubjects": ["2 alternative subject line options"]
}

Return only valid JSON.`;

  const { content } = await callAI(prompt, userId, organizationId, 'follow_up_email');
  return parseAIJSON<FollowUpEmailResult>(content);
}

// Networking Message Generator
export interface NetworkingMessageResult {
  message: string;
  platform: string;
  approach: string;
  followUpMessage?: string;
  tips: string[];
  personalizationPoints: string[];
}

export type NetworkingPlatform = 'linkedin' | 'email' | 'twitter';
export type NetworkingPurpose = 'job_inquiry' | 'informational_interview' | 'referral_request' | 'reconnection' | 'cold_outreach';

export async function generateNetworkingMessage(
  platform: NetworkingPlatform,
  purpose: NetworkingPurpose,
  context: {
    senderName: string;
    senderBackground: string;
    recipientName: string;
    recipientTitle: string;
    recipientCompany: string;
    commonGround?: string[];
    targetRole?: string;
    specificAsk?: string;
  },
  userId: string,
  organizationId?: string | null
): Promise<NetworkingMessageResult> {
  const platformLimits: Record<NetworkingPlatform, string> = {
    linkedin: 'LinkedIn connection request (300 char limit) or InMail (up to 1900 chars)',
    email: 'Professional email (keep under 200 words)',
    twitter: 'Twitter DM (brief and casual, under 280 chars ideal)',
  };

  const purposeDescriptions: Record<NetworkingPurpose, string> = {
    job_inquiry: 'Inquiring about job opportunities at their company',
    informational_interview: 'Requesting 15-20 minutes to learn about their career path',
    referral_request: 'Asking for a referral or introduction',
    reconnection: 'Reconnecting with an old contact',
    cold_outreach: 'Reaching out to someone you have never met',
  };

  const prompt = `You are an expert at professional networking and cold outreach. Write a compelling message.

PLATFORM: ${platform} - ${platformLimits[platform]}
PURPOSE: ${purposeDescriptions[purpose]}

SENDER INFO:
- Name: ${context.senderName}
- Background: ${context.senderBackground}
${context.targetRole ? `- Target Role: ${context.targetRole}` : ''}

RECIPIENT INFO:
- Name: ${context.recipientName}
- Title: ${context.recipientTitle}
- Company: ${context.recipientCompany}
${context.commonGround?.length ? `- Common Ground: ${context.commonGround.join(', ')}` : ''}
${context.specificAsk ? `- Specific Ask: ${context.specificAsk}` : ''}

Guidelines:
1. Lead with value or genuine interest, not with "I need a job"
2. Reference specific common ground or their work
3. Be concise and respect their time
4. Make the ask clear but not pushy
5. Sound human, not templated
6. ${platform === 'linkedin' ? 'Keep connection request under 300 chars' : 'Appropriate length for platform'}

Return JSON:
{
  "message": "The networking message text",
  "platform": "${platform}",
  "approach": "Brief explanation of the strategy used",
  "followUpMessage": "A follow-up message if they don't respond (optional)",
  "tips": ["3-4 tips for this type of outreach"],
  "personalizationPoints": ["Specific elements that should be further personalized"]
}

Return only valid JSON.`;

  const { content } = await callAI(prompt, userId, organizationId, 'networking_message');
  return parseAIJSON<NetworkingMessageResult>(content);
}
