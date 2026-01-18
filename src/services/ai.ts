import Groq from 'groq-sdk';
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

// Initialize Groq client
const groq = config.ai.groqApiKey ? new Groq({ apiKey: config.ai.groqApiKey }) : null;

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

Job Description:
{job_description}

Return a JSON object:
{
  "requiredSkills": ["ONLY skills explicitly marked as required or must-have"],
  "preferredSkills": ["Skills marked as preferred, nice-to-have, or bonus"],
  "responsibilities": ["Key job duties - be specific, not generic"],
  "keywords": ["Exact technical terms, tools, methodologies mentioned"],
  "qualifications": ["Degree requirements, certifications, years of experience"],
  "companyInfo": "Brief company/role context if mentioned"
}

Return only valid JSON, no markdown.`,

    resume_customize: `You are an expert resume customizer. Tailor this resume for a specific job while maintaining 100% factual accuracy.

ABSOLUTE RULES - VIOLATION MEANS FAILURE:
1. NEVER fabricate skills, experience, or qualifications not in the original
2. NEVER add fake projects, achievements, or metrics
3. NEVER claim expertise in tools/technologies not demonstrated
4. Only rephrase, reorder, and highlight EXISTING content
5. If the candidate lacks a required skill, put it in missingKeywords - do NOT add it

HONEST ASSESSMENT REQUIRED:
- If this resume is a poor match for the job, SAY SO in changesExplanation
- If critical requirements are missing, list them ALL in missingKeywords
- Do not oversell transferable skills - be realistic about the match

Original Resume Data:
{resume_data}

Target Job Information:
{job_data}

Job Title: {job_title}
Company: {company_name}

Return a JSON object with:
- tailoredData: the modified resume data (same structure as input)
- changesExplanation: HONEST explanation including how strong/weak this match is
- matchedKeywords: array of job keywords genuinely found in the resume
- missingKeywords: array of ALL job keywords the candidate lacks (be thorough)
- matchStrength: "strong" | "moderate" | "weak" | "poor" - honest assessment

Focus on:
1. Reordering bullet points to highlight most relevant experience first
2. Rephrasing descriptions to match job language while staying truthful
3. Being HONEST about gaps - a candidate with 2 years experience applying for a senior role should have that noted

Return only valid JSON.`,

    ats_analysis: `You are a STRICT and CRITICAL ATS (Applicant Tracking System) analyzer. Your job is to provide HONEST, ACCURATE scores - NOT inflated ones.

Resume:
{resume_text}

Job Keywords:
{job_keywords}

CRITICAL SCORING RULES - FOLLOW EXACTLY:
1. KEYWORD MATCHING IS MATHEMATICAL: If job requires 20 keywords and resume has 8, that's 40% - NOT 70%+
2. MISSING KEYWORDS = MAJOR PENALTY: Each missing required skill drops the score significantly
3. VAGUE CONTENT = LOW SCORE: Generic phrases like "team player" or "hard worker" without specifics score poorly
4. NO METRICS = PENALTY: Bullet points without numbers/percentages/results are weak
5. IRRELEVANT EXPERIENCE = DOES NOT COUNT: Don't give credit for unrelated skills
6. SHORT/THIN RESUMES score LOW: A resume with minimal content cannot score high

SCORE GUIDELINES (BE STRICT):
- 90-100: Near-perfect keyword match, quantified achievements, directly relevant experience (RARE)
- 75-89: Strong match with most keywords, good metrics, relevant background
- 60-74: Moderate match, some relevant keywords, lacks quantification
- 40-59: Weak match, missing many keywords, vague descriptions
- 20-39: Poor match, mostly irrelevant content, major gaps
- 0-19: Essentially no match to job requirements

A DUMMY/FAKE RESUME with generic info should score 20-40 MAX.
A resume missing 50%+ of required skills should score BELOW 50.

Provide a detailed analysis as JSON:
{
  "score": 0-100 (BE HONEST - most resumes score 40-70, not 80+),
  "keywordMatchPercentage": ACTUAL percentage calculated mathematically,
  "matchedKeywords": [...keywords ACTUALLY found - must exist verbatim or as clear synonyms],
  "missingKeywords": [...keywords NOT in resume - be thorough],
  "sectionScores": {
    "summary": 0-100 (0 if missing, penalize if generic/vague),
    "experience": 0-100 (penalize lack of metrics, irrelevant roles),
    "skills": 0-100 (only count RELEVANT skills that match job),
    "education": 0-100 (based on job requirements match),
    "formatting": 0-100 (structure, readability, ATS-friendliness)
  },
  "formattingIssues": [...any formatting problems],
  "recommendations": [...specific, actionable improvements with examples],
  "atsExtractedView": "plain text as an ATS would see it",
  "riskyElements": [...elements ATS might ignore or misread],
  "honestAssessment": "A blunt 1-2 sentence assessment of this resume's actual competitiveness"
}

REMEMBER: Your job is to help users improve by being HONEST, not to make them feel good with inflated scores.

Return only valid JSON.`,

    truth_guard: `You are a STRICT accuracy checker. Your job is to catch ANY fabrication, exaggeration, or misrepresentation between the original and tailored resume.

BE EXTREMELY VIGILANT. Even small exaggerations can cost candidates job offers if discovered.

Original Resume:
{original_data}

Tailored Resume:
{tailored_data}

CHECK FOR THESE RED FLAGS (be thorough):
1. ROLE INFLATION: "assisted" → "managed", "participated" → "led", "helped" → "spearheaded"
2. ADDED SKILLS: Any skill in tailored version not present in original
3. METRIC FABRICATION: Numbers/percentages that weren't in original or seem inflated
4. SCOPE EXAGGERATION: Team sizes, budget amounts, user counts inflated
5. TITLE CHANGES: Job titles modified to sound more senior
6. DATE MANIPULATION: Gaps hidden, tenure extended
7. RESPONSIBILITY CREEP: Taking credit for team/company achievements
8. KEYWORD STUFFING: Adding technologies/tools not actually used
9. UNSUPPORTED CLAIMS: "Expert in X" when original shows basic exposure

SEVERITY GUIDELINES:
- HIGH: Fabricated skills, significantly inflated metrics, added experiences that don't exist
- MEDIUM: Role inflation (assisted→managed), moderately inflated numbers
- LOW: Minor rephrasing that slightly overstates (but still defensible)

Return a JSON array of warnings:
[
  {
    "type": "exaggeration|fabrication|inconsistency|unsupported_claim",
    "section": "section name",
    "original": "exact original text",
    "tailored": "the modified text",
    "concern": "specific explanation of the issue",
    "severity": "low|medium|high",
    "recommendation": "how to fix this while staying honest"
  }
]

IMPORTANT: It's better to flag something questionable than to miss a fabrication. Err on the side of caution.

If genuinely no issues found, return empty array: []
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
async function callAI(
  prompt: string,
  userId: string,
  organizationId: string | null | undefined,
  operation: string,
  maxTokens: number = 4096
): Promise<{ content: string; promptTokens: number; completionTokens: number }> {
  const startTime = Date.now();

  try {
    if (!groq) {
      throw new AIServiceError('Groq API key not configured');
    }

    const response = await groq.chat.completions.create({
      model: config.ai.groqModel,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.3, // Lower temperature for more consistent, critical analysis
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
      'groq',
      config.ai.groqModel,
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
      'groq',
      config.ai.groqModel,
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

  return JSON.parse(cleaned) as T;
}

// Analyze job description
export async function analyzeJobDescription(
  jobDescription: string,
  userId: string,
  organizationId?: string | null
): Promise<JobData> {
  const promptTemplate = await getPrompt('job_analysis');
  const prompt = promptTemplate.replace('{job_description}', jobDescription);

  const { content } = await callAI(prompt, userId, organizationId, 'job_analysis');

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
  organizationId?: string | null
): Promise<Omit<CustomizationResult, 'atsScore' | 'atsDetails' | 'truthGuardWarnings'>> {
  // Use full resume text for better context
  const prompt = `You are an expert resume customizer. Your task is to tailor this resume for a specific job application.

CRITICAL RULES - READ CAREFULLY:
1. PRESERVE ALL CONTENT - Do NOT remove or shorten any experience, education, projects, or skills
2. Include EVERY job position with ALL bullet points from the original
3. Include ALL skills, certifications, and projects
4. You may REORDER items to put most relevant first
5. You may REPHRASE bullet points to use job keywords naturally
6. You may enhance the summary to target this specific role
7. NEVER fabricate, exaggerate, or add anything not in the original

ORIGINAL RESUME TEXT:
${resumeText}

TARGET JOB:
- Position: ${jobTitle}
- Company: ${companyName}
- Required Skills: ${jobData.requiredSkills?.join(', ') || 'Not specified'}
- Key Responsibilities: ${jobData.responsibilities?.slice(0, 5).join('; ') || 'Not specified'}
- Important Keywords: ${jobData.keywords?.join(', ') || 'Not specified'}

OUTPUT REQUIREMENTS:
Return a complete JSON object. The tailoredData MUST contain ALL original content, just optimized for this job.

{
  "tailoredData": {
    "contact": {
      "name": "Full name from resume",
      "email": "email from resume",
      "phone": "phone from resume",
      "location": "location from resume",
      "linkedin": "linkedin if present",
      "github": "github if present"
    },
    "summary": "A compelling 2-3 sentence summary tailored for ${jobTitle} role, highlighting most relevant experience",
    "experience": [
      {
        "title": "Job Title",
        "company": "Company Name",
        "location": "Location if available",
        "startDate": "Start Date",
        "endDate": "End Date or empty if current",
        "current": true/false,
        "description": ["INCLUDE ALL original bullet points, rephrased with relevant keywords"]
      }
    ],
    "education": [
      {
        "degree": "Degree name",
        "institution": "School name",
        "graduationDate": "Date",
        "gpa": "GPA if mentioned",
        "achievements": ["Any honors or achievements"]
      }
    ],
    "skills": ["ALL skills from resume, reordered with most relevant to ${jobTitle} first"],
    "certifications": ["ALL certifications from resume"],
    "projects": [
      {
        "name": "Project name",
        "description": "Project description",
        "technologies": ["tech used"]
      }
    ]
  },
  "changesExplanation": "Explain what was reordered or rephrased to optimize for this role",
  "matchedKeywords": ["job keywords found in resume"],
  "missingKeywords": ["important job keywords NOT in the original resume"],
  "beforeAfterComparisons": [
    {
      "section": "Summary|Experience - Company Name|Skills",
      "before": "The original text before optimization",
      "after": "The optimized text after changes",
      "improvement": "Brief explanation of why this change improves ATS/recruiter appeal",
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

IMPORTANT:
- The experience array must include EVERY position from the original resume with ALL bullet points. Do not summarize or truncate.
- Include at least 3-5 beforeAfterComparisons showing the most impactful changes made.`;

  // Use higher token limit for comprehensive resume output
  const { content } = await callAI(prompt, userId, organizationId, 'resume_customize', 8192);

  const result = parseAIJSON<{
    tailoredData: ParsedResumeData;
    changesExplanation: string;
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

  // Generate tailored text from data
  const tailoredText = generateResumeText(result.tailoredData);

  return {
    tailoredData: result.tailoredData,
    tailoredText,
    changesExplanation: result.changesExplanation,
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
  organizationId?: string | null
): Promise<ATSAnalysis> {
  const promptTemplate = await getPrompt('ats_analysis');
  const prompt = promptTemplate
    .replace('{resume_text}', resumeText)
    .replace('{job_keywords}', JSON.stringify(jobKeywords));

  const { content } = await callAI(prompt, userId, organizationId, 'ats_analysis');

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

  const { content } = await callAI(prompt, userId, organizationId, 'truth_guard');

  return parseAIJSON<TruthGuardWarning[]>(content);
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

  // Contact
  if (data.contact.name) lines.push(data.contact.name);
  const contactDetails = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.linkedin,
  ].filter(Boolean);
  if (contactDetails.length > 0) lines.push(contactDetails.join(' | '));
  lines.push('');

  // Summary
  if (data.summary) {
    lines.push('SUMMARY');
    lines.push(data.summary);
    lines.push('');
  }

  // Experience
  if (data.experience.length > 0) {
    lines.push('EXPERIENCE');
    for (const exp of data.experience) {
      lines.push(`${exp.title} at ${exp.company}`);
      if (exp.startDate || exp.endDate) {
        lines.push(`${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`);
      }
      for (const desc of exp.description) {
        lines.push(`• ${desc}`);
      }
      lines.push('');
    }
  }

  // Education
  if (data.education.length > 0) {
    lines.push('EDUCATION');
    for (const edu of data.education) {
      lines.push(edu.degree);
      if (edu.institution) lines.push(edu.institution);
      if (edu.graduationDate) lines.push(edu.graduationDate);
      lines.push('');
    }
  }

  // Skills
  if (data.skills.length > 0) {
    lines.push('SKILLS');
    lines.push(data.skills.join(', '));
    lines.push('');
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    lines.push('CERTIFICATIONS');
    for (const cert of data.certifications) {
      lines.push(`• ${cert}`);
    }
    lines.push('');
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    lines.push('PROJECTS');
    for (const project of data.projects) {
      lines.push(project.name);
      if (project.description) lines.push(project.description);
      if (project.technologies) lines.push(`Technologies: ${project.technologies.join(', ')}`);
      lines.push('');
    }
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

  // Step 2: Customize resume
  const customization = await customizeResume(
    resumeData,
    resumeText,
    jobData,
    jobTitle,
    companyName,
    userId,
    organizationId
  );

  // Step 3: Run ATS analysis
  const atsDetails = await analyzeATS(
    customization.tailoredText,
    [...jobData.requiredSkills, ...jobData.keywords],
    userId,
    organizationId
  );

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

  const { content } = await callAI(prompt, userId, organizationId, 'job_match_score');
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
