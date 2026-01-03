import { PrismaClient, UserRole, PlanType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@resumecustomizer.com' },
    update: {},
    create: {
      email: 'admin@resumecustomizer.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      emailVerified: true,
      subscription: {
        create: {
          planType: PlanType.PRO,
          resumeLimit: -1,
        },
      },
    },
  });
  console.log('Created admin user:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      passwordHash: userPassword,
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.USER,
      emailVerified: true,
      subscription: {
        create: {
          planType: PlanType.FREE,
          resumeLimit: 1,
        },
      },
    },
  });
  console.log('Created test user:', user.email);

  // Create default resume templates
  const templates = [
    {
      name: 'Professional',
      description: 'Clean and professional single-column layout, ideal for corporate roles',
      isDefault: true,
      isPremium: false,
      isAtsSafe: true,
      templateConfig: {
        name: 'Professional',
        layout: 'single-column',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        fontFamily: 'Helvetica',
        fontSize: { header: 24, subheader: 14, body: 11 },
        margins: { top: 50, right: 50, bottom: 50, left: 50 },
        sections: {
          order: ['summary', 'experience', 'education', 'skills', 'certifications'],
          visible: { summary: true, experience: true, education: true, skills: true, certifications: true, projects: true },
        },
      },
    },
    {
      name: 'Modern',
      description: 'Contemporary design with subtle accents, great for tech and creative roles',
      isDefault: false,
      isPremium: true,
      isAtsSafe: true,
      templateConfig: {
        name: 'Modern',
        layout: 'single-column',
        primaryColor: '#059669',
        secondaryColor: '#047857',
        fontFamily: 'Arial',
        fontSize: { header: 26, subheader: 13, body: 11 },
        margins: { top: 40, right: 45, bottom: 40, left: 45 },
        sections: {
          order: ['summary', 'skills', 'experience', 'projects', 'education'],
          visible: { summary: true, experience: true, education: true, skills: true, certifications: true, projects: true },
        },
      },
    },
    {
      name: 'Executive',
      description: 'Sophisticated layout for senior professionals and executives',
      isDefault: false,
      isPremium: true,
      isAtsSafe: true,
      templateConfig: {
        name: 'Executive',
        layout: 'single-column',
        primaryColor: '#1f2937',
        secondaryColor: '#374151',
        fontFamily: 'Times-Roman',
        fontSize: { header: 22, subheader: 14, body: 11 },
        margins: { top: 60, right: 60, bottom: 60, left: 60 },
        sections: {
          order: ['summary', 'experience', 'education', 'skills', 'certifications'],
          visible: { summary: true, experience: true, education: true, skills: true, certifications: true, projects: false },
        },
      },
    },
  ];

  for (const template of templates) {
    await prisma.resumeTemplate.upsert({
      where: { id: template.name.toLowerCase() },
      update: template,
      create: {
        id: template.name.toLowerCase(),
        ...template,
      },
    });
    console.log('Created template:', template.name);
  }

  // Create default prompts
  const prompts = [
    {
      name: 'job_analysis',
      promptText: `Analyze the following job description and extract structured information.
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
    },
    {
      name: 'resume_customize',
      promptText: `You are an expert resume customizer. Your task is to tailor a resume for a specific job while maintaining 100% factual accuracy.

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
    },
    {
      name: 'ats_analysis',
      promptText: `Analyze this resume for ATS (Applicant Tracking System) compatibility against the job description.

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
    },
    {
      name: 'truth_guard',
      promptText: `Review this tailored resume for potential exaggerations or inconsistencies.

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
    },
    {
      name: 'cover_letter',
      promptText: `Write a professional cover letter for this job application.

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
    },
  ];

  for (const prompt of prompts) {
    await prisma.promptVersion.upsert({
      where: { name: prompt.name },
      update: { promptText: prompt.promptText },
      create: {
        name: prompt.name,
        version: 1,
        promptText: prompt.promptText,
        isActive: true,
      },
    });
    console.log('Created prompt:', prompt.name);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
