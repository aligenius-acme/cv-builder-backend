import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { generateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { ValidationError, AuthenticationError, ConflictError, NotFoundError } from '../utils/errors';
import { generateToken as generateSecureToken } from '../utils/encryption';
import { UserRole } from '@prisma/client';
import { emailService } from '../services/email';

// Register new user
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        emailVerifyToken: generateSecureToken(),
      },
    });

    // Send verification email (non-blocking)
    if (user.emailVerifyToken) {
      emailService.sendVerificationEmail(user.email, user.emailVerifyToken, firstName).catch((err) => {
        console.error('Failed to send verification email:', err);
      });
    }

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
          aiCredits: user.aiCredits,
          aiCreditsUsed: user.aiCreditsUsed,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check password (passwordHash can be null for OAuth users)
    if (!user.passwordHash) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
          aiCredits: user.aiCredits,
          aiCreditsUsed: user.aiCreditsUsed,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
export const me = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            resumes: true,
            coverLetters: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        aiCredits: user.aiCredits,
        aiCreditsUsed: user.aiCreditsUsed,
        stats: {
          resumes: user._count.resumes,
          coverLetters: user._count.coverLetters,
        },
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { firstName, lastName } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
      },
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }

    if (newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password (passwordHash can be null for OAuth users)
    if (!user.passwordHash) {
      throw new AuthenticationError('Cannot change password for OAuth accounts');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Request password reset
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if user exists
    if (!user) {
      res.json({
        success: true,
        message: 'If an account exists with this email, a reset link will be sent',
      });
      return;
    }

    // Generate reset token
    const resetToken = generateSecureToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send password reset email (non-blocking)
    emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName || undefined).catch((err) => {
      console.error('Failed to send password reset email:', err);
    });

    res.json({
      success: true,
      message: 'If an account exists with this email, a reset link will be sent',
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new ValidationError('Token and password are required');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    // Update password
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Verify email
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ValidationError('Verification token is required');
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
      },
    });

    if (!user) {
      throw new ValidationError('Invalid verification token');
    }

    if (user.emailVerified) {
      res.json({
        success: true,
        message: 'Email already verified',
      });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
      },
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification email
export const resendVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerified) {
      res.json({
        success: true,
        message: 'Email already verified',
      });
      return;
    }

    // Generate new verification token
    const verifyToken = generateSecureToken();
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifyToken: verifyToken,
      },
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verifyToken, user.firstName || undefined);

    res.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    next(error);
  }
};

// Get AI credits
export const getCredits = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        aiCredits: true,
        aiCreditsUsed: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: {
        total: user.aiCredits,
        used: user.aiCreditsUsed,
        remaining: user.aiCredits - user.aiCreditsUsed,
      },
    });
  } catch (error) {
    next(error);
  }
};
