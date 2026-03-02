import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

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
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 20); // safety limit

    if (skills.length === 0) {
      return res.json({ success: true, data: {} });
    }

    const rows = await prisma.affiliateLink.findMany({
      where: { skill: { in: skills }, isActive: true },
      select: { skill: true, title: true, url: true, provider: true },
    });

    const result: Record<string, { title: string; url: string; provider: string }> = {};
    for (const row of rows) {
      result[row.skill] = { title: row.title, url: row.url, provider: row.provider };
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
