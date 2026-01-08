import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';
import { prisma } from '../utils/prisma';
import config from '../config';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { UserRole, PlanType } from '@prisma/client';

// Re-export AuthenticatedRequest for controllers
export { AuthenticatedRequest } from '../types';

interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Authenticate user from JWT token
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        subscription: true,
        organization: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Determine plan type
    let planType: PlanType = PlanType.FREE;
    if (user.subscription) {
      planType = user.subscription.planType;
    } else if (user.organization?.subscription) {
      planType = PlanType.BUSINESS;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      planType,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        subscription: true,
      },
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        planType: user.subscription?.planType || PlanType.FREE,
      };
    }

    next();
  } catch {
    // Silently fail for optional auth
    next();
  }
};

// Require specific roles
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

// Require admin role
export const requireAdmin = requireRole(UserRole.ADMIN);

// Require organization admin or super admin
export const requireOrgAdmin = requireRole(UserRole.ORG_ADMIN, UserRole.ADMIN);

// Generate JWT token
export const generateToken = (user: { id: string; email: string; role: UserRole }): string => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  // Cast expiresIn to the expected type (e.g., '7d', '1h')
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
};
