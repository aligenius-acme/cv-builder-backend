import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { prisma } from '../utils/prisma';
import { QuotaExceededError } from '../utils/errors';

const PRO_DAILY_CAP = 200;

/**
 * Middleware to check if user has available AI credits.
 * Pro users bypass the lifetime credit limit but have a 200 calls/day anti-abuse cap.
 * Free users get 5 lifetime credits.
 */
export const checkAICredits = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new Error('User not authenticated'));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        aiCredits: true,
        aiCreditsUsed: true,
        plan: true,
      },
    });

    if (!user) {
      return next(new Error('User not found'));
    }

    if (user.plan === 'PRO') {
      // Anti-abuse cap: 200 logged AI calls/day. A normal user doing 10 tailorings/day = 40 calls.
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const dailyUsage = await prisma.aIUsageLog.count({
        where: { userId, success: true, createdAt: { gte: todayStart } },
      });
      if (dailyUsage >= PRO_DAILY_CAP) {
        throw new QuotaExceededError('Daily usage limit reached. Resets at midnight.');
      }
      (req as any).credits = { isPro: true, remaining: PRO_DAILY_CAP - dailyUsage };
      return next();
    }

    // FREE user: lifetime credit check
    const remainingCredits = user.aiCredits - user.aiCreditsUsed;

    if (remainingCredits <= 0) {
      throw new QuotaExceededError(
        'You have used all your AI credits. Upgrade to Pro for unlimited access!'
      );
    }

    (req as any).credits = {
      total: user.aiCredits,
      used: user.aiCreditsUsed,
      remaining: remainingCredits,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Deduct one AI credit from a FREE user after a successful AI endpoint.
 * Pro users are skipped — credits are not counted for them.
 */
export const deductAICredit = async (userId: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  if (user?.plan === 'PRO') return;
  await prisma.user.update({
    where: { id: userId },
    data: { aiCreditsUsed: { increment: 1 } },
  });
};

/**
 * Get user's remaining AI credits
 */
export const getRemainingCredits = async (userId: string): Promise<number> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      aiCredits: true,
      aiCreditsUsed: true,
    },
  });

  if (!user) {
    return 0;
  }

  return user.aiCredits - user.aiCreditsUsed;
};
