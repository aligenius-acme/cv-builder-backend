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
const openai_1 = __importDefault(require("openai"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const config_1 = __importDefault(require("../config"));
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const subscription_1 = require("../middleware/subscription");
// Initialize AI clients
const openai = config_1.default.ai.openaiApiKey ? new openai_1.default({ apiKey: config_1.default.ai.openaiApiKey }) : null;
const anthropic = config_1.default.ai.anthropicApiKey ? new sdk_1.default({ apiKey: config_1.default.ai.anthropicApiKey }) : null;
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
async function callAI(prompt, userId, organizationId, operation) {
    const startTime = Date.now();
    const provider = config_1.default.ai.provider;
    try {
        let result;
        if (provider === 'anthropic' && anthropic) {
            const response = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4096,
                messages: [{ role: 'user', content: prompt }],
            });
            const textContent = response.content.find(c => c.type === 'text');
            result = {
                content: textContent?.text || '',
                promptTokens: response.usage.input_tokens,
                completionTokens: response.usage.output_tokens,
            };
        }
        else if (openai) {
            const response = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 4096,
                temperature: 0.7,
            });
            result = {
                content: response.choices[0]?.message?.content || '',
                promptTokens: response.usage?.prompt_tokens || 0,
                completionTokens: response.usage?.completion_tokens || 0,
            };
        }
        else {
            throw new errors_1.AIServiceError('No AI provider configured');
        }
        const durationMs = Date.now() - startTime;
        // Track usage
        await (0, subscription_1.trackAIUsage)(userId, organizationId, operation, provider, provider === 'anthropic' ? 'claude-3-5-sonnet' : 'gpt-4-turbo', result.promptTokens, result.completionTokens, durationMs, true);
        return result;
    }
    catch (error) {
        const durationMs = Date.now() - startTime;
        await (0, subscription_1.trackAIUsage)(userId, organizationId, operation, provider, provider === 'anthropic' ? 'claude-3-5-sonnet' : 'gpt-4-turbo', 0, 0, durationMs, false, error.message);
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
    return JSON.parse(cleaned.trim());
}
// Analyze job description
async function analyzeJobDescription(jobDescription, userId, organizationId) {
    const promptTemplate = await getPrompt('job_analysis');
    const prompt = promptTemplate.replace('{job_description}', jobDescription);
    const { content } = await callAI(prompt, userId, organizationId, 'job_analysis');
    return parseAIJSON(content);
}
// Customize resume for job
async function customizeResume(resumeData, jobData, jobTitle, companyName, userId, organizationId) {
    const promptTemplate = await getPrompt('resume_customize');
    const prompt = promptTemplate
        .replace('{resume_data}', JSON.stringify(resumeData, null, 2))
        .replace('{job_data}', JSON.stringify(jobData, null, 2))
        .replace('{job_title}', jobTitle)
        .replace('{company_name}', companyName);
    const { content } = await callAI(prompt, userId, organizationId, 'resume_customize');
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
    const customization = await customizeResume(resumeData, jobData, jobTitle, companyName, userId, organizationId);
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
//# sourceMappingURL=ai.js.map