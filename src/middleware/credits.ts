import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { prisma } from '../utils/prisma';
import { QuotaExceededError } from '../utils/errors';

/**
 * Middleware to check if user has available AI credits
 * All users get 5 lifetime AI credits (no renewals)
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

    // Get user's current credit status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        aiCredits: true,
        aiCreditsUsed: true,
      },
    });

    if (!user) {
      return next(new Error('User not found'));
    }

    // Calculate remaining credits
    const remainingCredits = user.aiCredits - user.aiCreditsUsed;

    if (remainingCredits <= 0) {
      throw new QuotaExceededError(
        'You have used all your AI credits. Check out our recommended tools and courses to boost your job search!'
      );
    }

    // Add credit info to request for use in controllers
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
 * Deduct one AI credit from user after successful AI operation
 */
export const deductAICredit = async (userId: string): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      aiCreditsUsed: {
        increment: 1,
      },
    },
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
