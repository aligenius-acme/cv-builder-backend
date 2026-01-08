"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeJobDescription = analyzeJobDescription;
exports.customizeResume = customizeResume;
exports.analyzeATS = analyzeATS;
exports.runTruthGuard = runTruthGuard;
exports.generateCoverLetter = generateCoverLetter;
exports.fullCustomizationPipeline = fullCustomizationPipeline;
exports.calculateJobMatchScore = calculateJobMatchScore;
exports.quantifyAchievements = quantifyAchievements;
exports.detectWeaknesses = detectWeaknesses;
exports.generateFollowUpEmail = generateFollowUpEmail;
exports.generateNetworkingMessage = generateNetworkingMessage;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const config_1 = __importDefault(require("../config"));
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const subscription_1 = require("../middleware/subscription");
// Initialize Groq client
const groq = config_1.default.ai.groqApiKey ? new groq_sdk_1.default({ apiKey: config_1.default.ai.groqApiKey }) : null;
// Get active prompts from database or use defaults
async function getPrompt(name) {
    const prompt = await prisma_1.prisma.promptVersion.findFirst({
        where: { name, isActive: true },
        orderBy: { version: 'desc' },
    });
    return prompt?.promptText || getDefaultPrompt(name);
}
// Default prompts
function getDefaultPrompt(name) {
    const prompts = {
        job_analysis: `Analyze the following job description and extract structured information.
Return a JSON object with these fields:
- requiredSkills: array of required technical and soft skills
- preferredSkills: array of preferred/nice-to-have skills
- responsibilities: array of key job responsibilities
- keywords: array of important keywords for ATS matching
- qualifications: array of required qualifications
- companyInfo: brief description of company/role context

Job Description:
{job_description}

Return only valid JSON, no markdown.`,
        resume_customize: `You are an expert resume customizer. Your task is to tailor a resume for a specific job while maintaining 100% factual accuracy.

CRITICAL RULES:
1. NEVER fabricate skills, experience, or qualifications the candidate doesn't have
2. NEVER add fake projects or achievements
3. Only rephrase, reorder, and highlight EXISTING content
4. Optimize for ATS by incorporating relevant keywords naturally
5. Maintain professional tone

Original Resume Data:
{resume_data}

Target Job Information:
{job_data}

Job Title: {job_title}
Company: {company_name}

Return a JSON object with:
- tailoredData: the modified resume data in the same structure as input
- changesExplanation: detailed explanation of what was changed and why
- matchedKeywords: array of job keywords found in the resume
- missingKeywords: array of job keywords NOT in the resume (candidate lacks these)

Focus on:
1. Reordering bullet points to highlight most relevant experience first
2. Rephrasing descriptions to match job language while staying truthful
3. Emphasizing transferable skills
4. Adding relevant keywords naturally where the experience supports them

Return only valid JSON.`,
        ats_analysis: `Analyze this resume for ATS (Applicant Tracking System) compatibility against the job description.

Resume:
{resume_text}

Job Keywords:
{job_keywords}

Provide a detailed analysis as JSON:
{
  "score": 0-100 overall ATS score,
  "keywordMatchPercentage": percentage of job keywords found,
  "matchedKeywords": [...keywords found in resume],
  "missingKeywords": [...keywords not in resume],
  "sectionScores": {
    "summary": 0-100,
    "experience": 0-100,
    "skills": 0-100,
    "education": 0-100,
    "formatting": 0-100
  },
  "formattingIssues": [...any formatting problems that might confuse ATS],
  "recommendations": [...specific improvements],
  "atsExtractedView": "plain text as an ATS would see it",
  "riskyElements": [...elements that ATS might ignore or misread]
}

Return only valid JSON.`,
        truth_guard: `Review this tailored resume for potential exaggerations or inconsistencies.

Original Resume:
{original_data}

Tailored Resume:
{tailored_data}

Check for:
1. Exaggerated claims (e.g., "managed" when originally "assisted")
2. Added skills not present in original
3. Inflated numbers or metrics
4. Inconsistent dates or titles
5. Unsupported claims

Return a JSON array of warnings:
[
  {
    "type": "exaggeration|inconsistency|unsupported_claim",
    "section": "section name",
    "original": "original text",
    "concern": "description of the issue",
    "severity": "low|medium|high"
  }
]

If no issues found, return empty array: []
Return only valid JSON.`,
        cover_letter: `Write a professional cover letter for this job application.

Candidate Resume:
{resume_data}

Job Information:
{job_data}

Job Title: {job_title}
Company: {company_name}
Tone: {tone}

Guidelines:
1. Opening: Express genuine interest in the role
2. Body: Connect 2-3 specific experiences/skills to job requirements
3. Use concrete examples from the resume
4. Show knowledge of the company (if info available)
5. Closing: Express enthusiasm and call to action
6. Keep it concise: 3-4 paragraphs max
7. NEVER fabricate experience or skills

Return only the cover letter text, no JSON or formatting markers.`,
    };
    return prompts[name] || '';
}
// Call AI provider
async function callAI(prompt, userId, organizationId, operation, maxTokens = 4096) {
    const startTime = Date.now();
    try {
        if (!groq) {
            throw new errors_1.AIServiceError('Groq API key not configured');
        }
        const response = await groq.chat.completions.create({
            model: config_1.default.ai.groqModel,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature: 0.7,
        });
        const result = {
            content: response.choices[0]?.message?.content || '',
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
        };
        const durationMs = Date.now() - startTime;
        // Track usage
        await (0, subscription_1.trackAIUsage)(userId, organizationId, operation, 'groq', config_1.default.ai.groqModel, result.promptTokens, result.completionTokens, durationMs, true);
        return result;
    }
    catch (error) {
        const durationMs = Date.now() - startTime;
        await (0, subscription_1.trackAIUsage)(userId, organizationId, operation, 'groq', config_1.default.ai.groqModel, 0, 0, durationMs, false, error.message);
        throw new errors_1.AIServiceError(`AI service error: ${error.message}`);
    }
}
// Parse JSON from AI response (handles markdown code blocks)
function parseAIJSON(content) {
    // Remove markdown code blocks if present
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
    }
    else if (cleaned.startsWith('```')) {
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
    return JSON.parse(cleaned);
}
// Analyze job description
async function analyzeJobDescription(jobDescription, userId, organizationId) {
    const promptTemplate = await getPrompt('job_analysis');
    const prompt = promptTemplate.replace('{job_description}', jobDescription);
    const { content } = await callAI(prompt, userId, organizationId, 'job_analysis');
    return parseAIJSON(content);
}
// Customize resume for job
async function customizeResume(resumeData, resumeText, jobData, jobTitle, companyName, userId, organizationId) {
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
  "missingKeywords": ["important job keywords NOT in the original resume"]
}

IMPORTANT: The experience array must include EVERY position from the original resume with ALL bullet points. Do not summarize or truncate.`;
    // Use higher token limit for comprehensive resume output
    const { content } = await callAI(prompt, userId, organizationId, 'resume_customize', 8192);
    const result = parseAIJSON(content);
    // Generate tailored text from data
    const tailoredText = generateResumeText(result.tailoredData);
    return {
        tailoredData: result.tailoredData,
        tailoredText,
        changesExplanation: result.changesExplanation,
        matchedKeywords: result.matchedKeywords,
        missingKeywords: result.missingKeywords,
    };
}
// Analyze ATS compatibility
async function analyzeATS(resumeText, jobKeywords, userId, organizationId) {
    const promptTemplate = await getPrompt('ats_analysis');
    const prompt = promptTemplate
        .replace('{resume_text}', resumeText)
        .replace('{job_keywords}', JSON.stringify(jobKeywords));
    const { content } = await callAI(prompt, userId, organizationId, 'ats_analysis');
    return parseAIJSON(content);
}
// Run Truth Guard check
async function runTruthGuard(originalData, tailoredData, userId, organizationId) {
    const promptTemplate = await getPrompt('truth_guard');
    const prompt = promptTemplate
        .replace('{original_data}', JSON.stringify(originalData, null, 2))
        .replace('{tailored_data}', JSON.stringify(tailoredData, null, 2));
    const { content } = await callAI(prompt, userId, organizationId, 'truth_guard');
    return parseAIJSON(content);
}
// Generate cover letter
async function generateCoverLetter(input, userId, organizationId) {
    const promptTemplate = await getPrompt('cover_letter');
    const prompt = promptTemplate
        .replace('{resume_data}', JSON.stringify(input.resumeData, null, 2))
        .replace('{job_data}', JSON.stringify(input.jobData, null, 2))
        .replace('{job_title}', input.jobTitle)
        .replace('{company_name}', input.companyName)
        .replace('{tone}', input.tone || 'professional');
    const { content } = await callAI(prompt, userId, organizationId, 'cover_letter');
    return content.trim();
}
// Generate plain text from structured resume data
function generateResumeText(data) {
    const lines = [];
    // Contact
    if (data.contact.name)
        lines.push(data.contact.name);
    const contactDetails = [
        data.contact.email,
        data.contact.phone,
        data.contact.location,
        data.contact.linkedin,
    ].filter(Boolean);
    if (contactDetails.length > 0)
        lines.push(contactDetails.join(' | '));
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
            if (edu.institution)
                lines.push(edu.institution);
            if (edu.graduationDate)
                lines.push(edu.graduationDate);
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
            if (project.description)
                lines.push(project.description);
            if (project.technologies)
                lines.push(`Technologies: ${project.technologies.join(', ')}`);
            lines.push('');
        }
    }
    return lines.join('\n');
}
// Full resume customization pipeline
async function fullCustomizationPipeline(resumeData, resumeText, jobDescription, jobTitle, companyName, userId, organizationId) {
    // Step 1: Analyze job description
    const jobData = await analyzeJobDescription(jobDescription, userId, organizationId);
    // Step 2: Customize resume
    const customization = await customizeResume(resumeData, resumeText, jobData, jobTitle, companyName, userId, organizationId);
    // Step 3: Run ATS analysis
    const atsDetails = await analyzeATS(customization.tailoredText, [...jobData.requiredSkills, ...jobData.keywords], userId, organizationId);
    // Step 4: Run Truth Guard
    const truthGuardWarnings = await runTruthGuard(resumeData, customization.tailoredData, userId, organizationId);
    return {
        ...customization,
        atsScore: atsDetails.score,
        atsDetails,
        truthGuardWarnings,
    };
}
async function calculateJobMatchScore(resumeData, jobDescription, jobTitle, userId, organizationId) {
    const prompt = `You are an expert job matching analyst. Calculate how well this candidate matches the job.

CANDIDATE RESUME:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

JOB TITLE: ${jobTitle}

Analyze the match and return a JSON object:
{
  "overallScore": 0-100 (realistic score based on actual match),
  "breakdown": {
    "skillsMatch": 0-100 (technical & soft skills alignment),
    "experienceMatch": 0-100 (years and relevance of experience),
    "educationMatch": 0-100 (degree and field alignment),
    "keywordsMatch": 0-100 (job keywords found in resume)
  },
  "strengths": ["3-5 specific strengths for this role"],
  "gaps": ["2-4 areas where candidate falls short"],
  "verdict": "Strong Match" (85+) | "Good Match" (70-84) | "Moderate Match" (50-69) | "Weak Match" (<50),
  "recommendation": "Specific advice on whether to apply and how to position themselves",
  "timeToApply": "Estimated time investment worthiness: 'Worth applying immediately' | 'Consider applying with improvements' | 'Focus on building missing skills first'"
}

Be honest and realistic - don't inflate scores. Consider:
- Direct skill matches vs transferable skills
- Years of experience vs job requirements
- Industry relevance
- Seniority level alignment

Return only valid JSON.`;
    const { content } = await callAI(prompt, userId, organizationId, 'job_match_score');
    return parseAIJSON(content);
}
async function quantifyAchievements(bullets, jobContext, userId, organizationId) {
    const prompt = `You are an expert resume writer specializing in quantifying achievements. Transform vague bullet points into impactful, metrics-driven statements.

BULLET POINTS TO ENHANCE:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

${jobContext ? `JOB CONTEXT (tailor enhancements for): ${jobContext}` : ''}

RULES:
1. NEVER fabricate specific numbers - use realistic ranges or estimates
2. Add context with percentages, team sizes, timeframes, or dollar amounts
3. Use action verbs and quantifiable outcomes
4. Keep the core truth of each achievement

Return JSON:
{
  "achievements": [
    {
      "original": "the original bullet point",
      "quantified": "the enhanced version with metrics",
      "addedMetrics": ["list of metrics/numbers added"],
      "impactLevel": "High/Medium/Low based on achievement significance",
      "suggestions": ["alternative phrasings or additional metrics to consider"]
    }
  ],
  "overallImprovement": "Summary of how these changes strengthen the resume",
  "tips": ["3-4 general tips for writing quantified achievements"]
}

Example transformation:
- Original: "Improved customer satisfaction"
- Quantified: "Increased customer satisfaction scores by 25% (from 3.2 to 4.0 stars) through implementation of new feedback system, serving 500+ monthly customers"

Return only valid JSON.`;
    const { content } = await callAI(prompt, userId || '', organizationId, 'quantify_achievements');
    return parseAIJSON(content);
}
async function detectWeaknesses(resumeData, resumeText, targetRole, userId, organizationId) {
    const prompt = `You are a harsh but fair resume critic and career coach. Identify ALL weaknesses and red flags in this resume.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

RESUME TEXT:
${resumeText}

${targetRole ? `TARGET ROLE: ${targetRole}` : ''}

Check for these issues:
1. Employment gaps (unexplained periods)
2. Job hopping (short tenures without explanation)
3. Vague descriptions lacking metrics
4. Missing contact information
5. Weak or missing summary
6. Skills mismatch with experience
7. Formatting/structure issues
8. Outdated or irrelevant content
9. Overused buzzwords without substance
10. Missing key sections
11. Inconsistent dates or formatting
12. Too short or too long content
13. Lack of career progression
14. Missing achievements (only duties listed)

Return JSON:
{
  "weaknesses": [
    {
      "issue": "Clear description of the problem",
      "location": "Where in the resume (e.g., 'Experience section - Company X')",
      "severity": "Critical/Major/Minor",
      "impact": "How this hurts their chances",
      "fix": "Specific actionable fix",
      "example": "Example of improved version (if applicable)"
    }
  ],
  "overallHealth": "Excellent (0-1 issues) | Good (2-3 minor) | Needs Work (multiple issues) | Critical Issues (major red flags)",
  "healthScore": 0-100,
  "prioritizedActions": ["Top 3-5 fixes in order of importance"],
  "positives": ["2-3 things the resume does well to balance feedback"]
}

Be thorough but constructive. Every weakness should have an actionable fix.

Return only valid JSON.`;
    const { content } = await callAI(prompt, userId || '', organizationId, 'weakness_detector');
    return parseAIJSON(content);
}
async function generateFollowUpEmail(type, context, userId, organizationId) {
    const typeInstructions = {
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
    return parseAIJSON(content);
}
async function generateNetworkingMessage(platform, purpose, context, userId, organizationId) {
    const platformLimits = {
        linkedin: 'LinkedIn connection request (300 char limit) or InMail (up to 1900 chars)',
        email: 'Professional email (keep under 200 words)',
        twitter: 'Twitter DM (brief and casual, under 280 chars ideal)',
    };
    const purposeDescriptions = {
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
    return parseAIJSON(content);
}
//# sourceMappingURL=ai.js.map