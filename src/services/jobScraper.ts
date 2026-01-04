import axios from 'axios';
import * as cheerio from 'cheerio';
import Groq from 'groq-sdk';
import config from '../config';
import { AppError } from '../utils/errors';

// Initialize Groq client
const groq = config.ai.groqApiKey ? new Groq({ apiKey: config.ai.groqApiKey }) : null;

// Job posting data extracted from URL
export interface ScrapedJobData {
  url: string;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  description: string;
  requirements?: string[];
  benefits?: string[];
  employmentType?: string;
  experienceLevel?: string;
  postedDate?: string;
  rawText: string;
}

// Common job board selectors
const JOB_BOARD_SELECTORS: Record<string, {
  title: string;
  company: string;
  description: string;
  location?: string;
}> = {
  'linkedin.com': {
    title: '.top-card-layout__title, .topcard__title, h1.t-24',
    company: '.topcard__org-name-link, .top-card-layout__second-subline a, .topcard__flavor--black-link',
    description: '.description__text, .show-more-less-html__markup',
    location: '.topcard__flavor--bullet, .top-card-layout__first-subline',
  },
  'indeed.com': {
    title: '.jobsearch-JobInfoHeader-title, h1[data-testid="jobsearch-JobInfoHeader-title"]',
    company: '.jobsearch-InlineCompanyRating-companyHeader a, [data-testid="inlineHeader-companyName"]',
    description: '#jobDescriptionText, .jobsearch-jobDescriptionText',
    location: '.jobsearch-JobInfoHeader-subtitle > div:last-child',
  },
  'glassdoor.com': {
    title: '[data-test="job-title"], .job-title',
    company: '[data-test="employer-name"], .employer-name',
    description: '.jobDescriptionContent, [data-test="job-description"]',
    location: '[data-test="location"], .location',
  },
  'greenhouse.io': {
    title: '.app-title, h1.heading',
    company: '.company-name, .brand-logo',
    description: '#content, .content',
    location: '.location',
  },
  'lever.co': {
    title: '.posting-headline h2',
    company: '.main-header-logo img',
    description: '.section-wrapper',
    location: '.location',
  },
  'workday.com': {
    title: '[data-automation-id="jobPostingHeader"] h2',
    company: '[data-automation-id="companyName"]',
    description: '[data-automation-id="jobPostingDescription"]',
    location: '[data-automation-id="locations"]',
  },
  'default': {
    title: 'h1, .job-title, .position-title, [class*="title"]',
    company: '.company, .employer, [class*="company"]',
    description: '.description, .job-description, [class*="description"], article, main',
    location: '.location, [class*="location"]',
  },
};

/**
 * Fetch and parse a job posting from a URL
 */
export async function scrapeJobPosting(url: string): Promise<ScrapedJobData> {
  try {
    // Validate URL
    const parsedUrl = new URL(url);

    // Fetch the page
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove scripts and styles
    $('script, style, noscript, iframe, nav, footer, header').remove();

    // Determine which selectors to use
    const hostname = parsedUrl.hostname.replace('www.', '');
    let selectors = JOB_BOARD_SELECTORS.default;

    for (const [domain, sels] of Object.entries(JOB_BOARD_SELECTORS)) {
      if (hostname.includes(domain)) {
        selectors = sels;
        break;
      }
    }

    // Extract basic info using selectors
    const title = $(selectors.title).first().text().trim();
    const company = $(selectors.company).first().text().trim();
    const location = selectors.location ? $(selectors.location).first().text().trim() : undefined;
    const descriptionHtml = $(selectors.description).first().html() || '';

    // Convert description HTML to clean text
    const descriptionText = cheerio.load(descriptionHtml).text().trim();

    // Get full page text for AI analysis
    const rawText = $('body').text()
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()
      .substring(0, 15000); // Limit to 15k chars

    // If we couldn't extract structured data, use AI
    if (!title || !descriptionText || descriptionText.length < 100) {
      return await extractJobDataWithAI(url, rawText);
    }

    return {
      url,
      title: cleanText(title),
      company: cleanText(company) || 'Unknown Company',
      location: location ? cleanText(location) : undefined,
      description: cleanText(descriptionText),
      rawText,
    };

  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new AppError('Unable to reach the job posting URL. Please check the URL and try again.', 400);
    }
    if (error.response?.status === 403) {
      throw new AppError('Access denied by the job site. Please copy and paste the job description manually.', 400);
    }
    if (error.response?.status === 404) {
      throw new AppError('Job posting not found. The position may have been removed.', 404);
    }

    throw new AppError(`Failed to fetch job posting: ${error.message}`, 500);
  }
}

/**
 * Use AI to extract job data from raw page text
 */
async function extractJobDataWithAI(url: string, rawText: string): Promise<ScrapedJobData> {
  if (!groq) {
    throw new AppError('AI service not configured', 500);
  }

  try {
    const prompt = `Extract job posting information from this webpage text. Return a JSON object with these fields:
- title: job title (required)
- company: company name (required)
- location: job location (if mentioned)
- salary: salary range (if mentioned)
- description: full job description with requirements and responsibilities
- requirements: array of key requirements/qualifications
- benefits: array of benefits (if mentioned)
- employmentType: full-time, part-time, contract, etc. (if mentioned)
- experienceLevel: entry, mid, senior, etc. (if mentioned)

Webpage text:
${rawText.substring(0, 12000)}

Return only valid JSON, no markdown.`;

    const completion = await groq.chat.completions.create({
      model: config.ai.groqModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const data = JSON.parse(jsonMatch[0]);

    return {
      url,
      title: data.title || 'Unknown Position',
      company: data.company || 'Unknown Company',
      location: data.location,
      salary: data.salary,
      description: data.description || rawText.substring(0, 5000),
      requirements: data.requirements,
      benefits: data.benefits,
      employmentType: data.employmentType,
      experienceLevel: data.experienceLevel,
      rawText,
    };

  } catch (error: any) {
    throw new AppError(`Failed to analyze job posting: ${error.message}`, 500);
  }
}

/**
 * Clean extracted text
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
}

/**
 * Format scraped job data into a job description string
 */
export function formatJobDescription(data: ScrapedJobData): string {
  let description = '';

  if (data.location) {
    description += `Location: ${data.location}\n\n`;
  }

  if (data.salary) {
    description += `Salary: ${data.salary}\n\n`;
  }

  if (data.employmentType) {
    description += `Employment Type: ${data.employmentType}\n\n`;
  }

  if (data.experienceLevel) {
    description += `Experience Level: ${data.experienceLevel}\n\n`;
  }

  description += data.description;

  if (data.requirements && data.requirements.length > 0) {
    description += '\n\nRequirements:\n' + data.requirements.map(r => `• ${r}`).join('\n');
  }

  if (data.benefits && data.benefits.length > 0) {
    description += '\n\nBenefits:\n' + data.benefits.map(b => `• ${b}`).join('\n');
  }

  return description;
}
