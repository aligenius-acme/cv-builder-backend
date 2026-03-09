/**
 * Affiliate course recommendations mapped by skill keyword.
 *
 * Programs to join (free):
 *  - Udemy: Impact / Rakuten (15% per sale)
 *  - Coursera: CJ Affiliate (up to $45/purchase, 30-day cookie)
 *  - Grammarly: Impact ($0.20/free signup, $20/upgrade)
 *  - LinkedIn Learning: Impact (~35% per sale)
 *
 * Replace placeholder URLs with your actual affiliate tracking links after joining each program.
 * You can manage all links from the Admin Panel → Affiliate Links.
 */

import { prisma } from '../utils/prisma';

export interface CourseRecommendation {
  title: string;
  url: string;
  provider: 'Udemy' | 'Coursera' | 'LinkedIn Learning' | 'Grammarly';
}

// ─── Static seed data (fallback + initial DB population) ─────────────────────

export const AFFILIATE_COURSE_MAP: Record<string, CourseRecommendation> = {
  // Programming languages
  python: {
    title: 'Complete Python Bootcamp: From Zero to Hero',
    url: 'https://www.udemy.com/course/complete-python-bootcamp/?couponCode=AFFILIATE',
    provider: 'Udemy',
  },
  javascript: {
    title: 'The Complete JavaScript Course 2024',
    url: 'https://www.udemy.com/course/the-complete-javascript-course/?couponCode=AFFILIATE',
    provider: 'Udemy',
  },
  typescript: {
    title: 'Understanding TypeScript',
    url: 'https://www.udemy.com/course/understanding-typescript/?couponCode=AFFILIATE',
    provider: 'Udemy',
  },
  java: {
    title: 'Java Programming Masterclass',
    url: 'https://www.udemy.com/course/java-the-complete-java-developer-course/?couponCode=AFFILIATE',
    provider: 'Udemy',
  },
  sql: {
    title: 'The Complete SQL Bootcamp',
    url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/?couponCode=AFFILIATE',
    provider: 'Udemy',
  },
  react: {
    title: 'React - The Complete Guide',
    url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/?couponCode=AFFILIATE',
    provider: 'Udemy',
  },
  'node.js': {
    title: 'The Complete Node.js Developer Course',
    url: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2/?couponCode=AFFILIATE',
    provider: 'Udemy',
  },
  nodejs: {
    title: 'The Complete Node.js Developer Course',
    url: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2/?couponCode=AFFILIATE',
    provider: 'Udemy',
  },
  docker: {
    title: 'Docker & Kubernetes: The Practical Guide',
    url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/?couponCode=AFFILIATE',
    provider: 'Udemy',
  },
  kubernetes: {
    title: 'Docker & Kubernetes: The Practical Guide',
    url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/?couponCode=AFFILIATE',
    provider: 'Udemy',
  },
  aws: {
    title: 'AWS Certified Solutions Architect',
    url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/?couponCode=AFFILIATE',
    provider: 'Udemy',
  },
  'machine learning': {
    title: 'Machine Learning Specialization',
    url: 'https://www.coursera.org/specializations/machine-learning-introduction',
    provider: 'Coursera',
  },
  'deep learning': {
    title: 'Deep Learning Specialization',
    url: 'https://www.coursera.org/specializations/deep-learning',
    provider: 'Coursera',
  },
  'data science': {
    title: 'IBM Data Science Professional Certificate',
    url: 'https://www.coursera.org/professional-certificates/ibm-data-science',
    provider: 'Coursera',
  },
  'data analysis': {
    title: 'Google Data Analytics Professional Certificate',
    url: 'https://www.coursera.org/professional-certificates/google-data-analytics',
    provider: 'Coursera',
  },
  'project management': {
    title: 'Google Project Management Certificate',
    url: 'https://www.coursera.org/professional-certificates/google-project-management',
    provider: 'Coursera',
  },
  agile: {
    title: 'Agile with Atlassian Jira',
    url: 'https://www.coursera.org/learn/agile-atlassian-jira',
    provider: 'Coursera',
  },
  scrum: {
    title: 'Scrum Master Certification Preparation',
    url: 'https://www.linkedin.com/learning/paths/prepare-for-the-pmi-agile-certified-practitioner-pmi-acp-exam',
    provider: 'LinkedIn Learning',
  },
  leadership: {
    title: 'Developing Your Leadership Skills',
    url: 'https://www.linkedin.com/learning/paths/develop-your-leadership-skills',
    provider: 'LinkedIn Learning',
  },
  communication: {
    title: 'Communication Foundations',
    url: 'https://www.linkedin.com/learning/communication-foundations-2018',
    provider: 'LinkedIn Learning',
  },
  excel: {
    title: 'Excel Essential Training',
    url: 'https://www.linkedin.com/learning/excel-essential-training-microsoft-365',
    provider: 'LinkedIn Learning',
  },
  'power bi': {
    title: 'Power BI Essential Training',
    url: 'https://www.linkedin.com/learning/power-bi-essential-training',
    provider: 'LinkedIn Learning',
  },
  tableau: {
    title: 'Tableau Essential Training',
    url: 'https://www.linkedin.com/learning/tableau-essential-training-2022',
    provider: 'LinkedIn Learning',
  },
  cybersecurity: {
    title: 'Google Cybersecurity Professional Certificate',
    url: 'https://www.coursera.org/professional-certificates/google-cybersecurity',
    provider: 'Coursera',
  },
  'digital marketing': {
    title: 'Google Digital Marketing & E-commerce Certificate',
    url: 'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce',
    provider: 'Coursera',
  },
  'resume writing': {
    title: 'Resume Writing Masterclass',
    url: 'https://www.udemy.com/course/writing-a-killer-resume/?couponCode=AFFILIATE',
    provider: 'Udemy',
  },
  'interview skills': {
    title: 'Interview Prep & Career Skills',
    url: 'https://www.udemy.com/course/master-the-tech-interview/?couponCode=AFFILIATE',
    provider: 'Udemy',
  },
};

/** Grammarly affiliate URL — shown after cover letter and resume summary generation */
export const GRAMMARLY_AFFILIATE_URL =
  'https://www.grammarly.com/?utm_source=affiliate&utm_medium=partner';

// ─── In-memory cache ──────────────────────────────────────────────────────────

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let _cache: {
  links: Map<string, CourseRecommendation>;
  grammarlyUrl: string;
  ts: number;
} | null = null;

async function loadCache() {
  try {
    const rows = await prisma.affiliateLink.findMany({ where: { isActive: true } });
    const map = new Map<string, CourseRecommendation>();
    let grammarlyUrl = GRAMMARLY_AFFILIATE_URL;

    for (const row of rows) {
      if (row.skill === 'grammarly') {
        grammarlyUrl = row.url;
      } else {
        map.set(row.skill.toLowerCase(), {
          title: row.title,
          url: row.url,
          provider: row.provider as CourseRecommendation['provider'],
        });
      }
    }

    _cache = { links: map, grammarlyUrl, ts: Date.now() };
  } catch {
    // DB error — fall back to static config silently
    _cache = null;
  }
  return _cache;
}

async function getCache() {
  if (!_cache || Date.now() - _cache.ts > CACHE_TTL) {
    await loadCache();
  }
  return _cache;
}

/** Invalidate cache (call after admin creates/updates/deletes an affiliate link) */
export function invalidateAffiliateCache() {
  _cache = null;
}

// ─── Public async getters ────────────────────────────────────────────────────

/**
 * Fetch course recommendations for a list of skill keywords.
 * Prefers DB rows; falls back to static AFFILIATE_COURSE_MAP on DB error.
 */
/** Find the best affiliate match for a single keyword using exact then partial matching. */
function findMatch(
  kw: string,
  lookup: (slug: string) => CourseRecommendation | undefined
): CourseRecommendation | undefined {
  const normalized = kw.toLowerCase().trim();
  // 1. Exact match
  const exact = lookup(normalized);
  if (exact) return exact;
  // 2. Strip common suffixes like ".js", " experience", " skills", " proficiency"
  const stripped = normalized
    .replace(/\.js$/i, '')
    .replace(/\s+(experience|skills?|proficiency|development|programming|knowledge)$/i, '')
    .trim();
  if (stripped !== normalized) {
    const stripMatch = lookup(stripped);
    if (stripMatch) return stripMatch;
  }
  // 3. Slug contains keyword or keyword contains slug (partial match)
  // handled by caller scanning all keys
  return undefined;
}

export async function getAffiliateCourses(keywords: string[]): Promise<CourseRecommendation[]> {
  const cache = await getCache();

  const results: CourseRecommendation[] = [];
  const seen = new Set<string>();

  const addCourse = (course: CourseRecommendation) => {
    if (!seen.has(course.url)) { seen.add(course.url); results.push(course); }
  };

  if (cache) {
    const allSlugs = Array.from(cache.links.keys());
    for (const kw of keywords) {
      const normalized = kw.toLowerCase().trim();
      const direct = findMatch(kw, (slug) => cache.links.get(slug));
      if (direct) { addCourse(direct); continue; }
      const partialSlug = allSlugs.find(
        (slug) => normalized.includes(slug) || slug.includes(normalized)
      );
      if (partialSlug) addCourse(cache.links.get(partialSlug)!);
    }
    return results;
  }

  // Fallback to static map
  const allSlugs = Object.keys(AFFILIATE_COURSE_MAP);
  for (const kw of keywords) {
    const normalized = kw.toLowerCase().trim();
    const direct = findMatch(kw, (slug) => AFFILIATE_COURSE_MAP[slug]);
    if (direct) { addCourse(direct); continue; }
    const partialSlug = allSlugs.find(
      (slug) => normalized.includes(slug) || slug.includes(normalized)
    );
    if (partialSlug) addCourse(AFFILIATE_COURSE_MAP[partialSlug]);
  }
  return results;
}

/**
 * Get the current Grammarly affiliate URL.
 * Prefers DB value; falls back to static constant on DB error.
 */
export async function getGrammarlyUrl(): Promise<string> {
  const cache = await getCache();
  return cache?.grammarlyUrl ?? GRAMMARLY_AFFILIATE_URL;
}

// ─── DB seeding (run on startup if table is empty) ───────────────────────────

/**
 * Populates the AffiliateLink table from the static config if it's empty.
 * Safe to call multiple times — no-op if data already exists.
 */
export async function seedAffiliateLinksIfEmpty(): Promise<void> {
  try {
    const count = await prisma.affiliateLink.count();
    if (count > 0) {
      await initCreditsPageDefaults();
      return;
    }

    const DEFAULT_CREDITS_PAGE_SKILLS = ['resume writing', 'interview skills', 'project management'];

    const entries = [
      ...Object.entries(AFFILIATE_COURSE_MAP).map(([skill, rec]) => ({
        skill,
        title: rec.title,
        url: rec.url,
        provider: rec.provider,
        isActive: true,
        showOnCreditsPage: DEFAULT_CREDITS_PAGE_SKILLS.includes(skill),
      })),
      {
        skill: 'grammarly',
        title: 'Grammarly — Polish Your Writing',
        url: GRAMMARLY_AFFILIATE_URL,
        provider: 'Grammarly',
        isActive: true,
        showOnCreditsPage: false,
      },
    ];

    await prisma.affiliateLink.createMany({ data: entries });
    console.log(`[affiliates] Seeded ${entries.length} affiliate links`);
  } catch (err) {
    console.error('[affiliates] Seed failed (non-fatal):', err);
  }
}

/**
 * One-time migration: if no affiliates have showOnCreditsPage=true yet,
 * set the 3 default skills so the out-of-credits page has content.
 */
async function initCreditsPageDefaults(): Promise<void> {
  try {
    const existing = await prisma.affiliateLink.count({ where: { showOnCreditsPage: true } });
    if (existing > 0) return;

    const DEFAULT_CREDITS_PAGE_SKILLS = ['resume writing', 'interview skills', 'project management'];
    await prisma.affiliateLink.updateMany({
      where: { skill: { in: DEFAULT_CREDITS_PAGE_SKILLS } },
      data: { showOnCreditsPage: true },
    });
    console.log('[affiliates] Initialized credits page defaults');
  } catch (err) {
    console.error('[affiliates] initCreditsPageDefaults failed (non-fatal):', err);
  }
}
