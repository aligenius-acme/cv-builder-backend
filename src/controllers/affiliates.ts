import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { getAffiliateCourses } from '../config/affiliateLinks';

/**
 * GET /api/affiliates/credits-page
 * Public endpoint — no authentication required.
 * Returns affiliates flagged for display on the out-of-credits page.
 */
export const getCreditsPageAffiliates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await prisma.affiliateLink.findMany({
      where: { showOnCreditsPage: true, isActive: true },
      select: { skill: true, title: true, url: true, provider: true },
      orderBy: { skill: 'asc' },
    });
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/affiliates?skills=skill1,skill2
 * Public endpoint — no authentication required.
 * Returns active affiliate links for the requested skill keywords.
 */
export const getPublicAffiliates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skillsParam = req.query.skills ? String(req.query.skills) : '';
    const skills = skillsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);

    if (skills.length === 0) {
      return res.json({ success: true, data: {} });
    }

    const result: Record<string, { title: string; url: string; provider: string }> = {};

    // Grammarly is keyed by slug so frontend can access res.data.grammarly.url
    if (skills.includes('grammarly')) {
      const { getGrammarlyUrl } = await import('../config/affiliateLinks');
      const url = await getGrammarlyUrl();
      result['grammarly'] = { title: 'Grammarly — Polish Your Writing', url, provider: 'Grammarly' };
    }

    const otherSkills = skills.filter((s) => s !== 'grammarly');
    if (otherSkills.length > 0) {
      const courses = await getAffiliateCourses(otherSkills);
      courses.forEach((c, i) => {
        result[`course_${i}`] = { title: c.title, url: c.url, provider: c.provider };
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
