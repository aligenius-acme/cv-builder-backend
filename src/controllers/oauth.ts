import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { generateToken } from '../middleware/auth';
import { ValidationError, AuthenticationError } from '../utils/errors';
import { AuthProvider } from '@prisma/client';
import * as oauthService from '../services/oauthService';

// Get OAuth URLs
export const getOAuthUrls = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const urls: { google?: string; github?: string } = {};

    if (oauthService.isGoogleConfigured()) {
      urls.google = oauthService.getGoogleAuthUrl();
    }

    if (oauthService.isGitHubConfigured()) {
      urls.github = oauthService.getGitHubAuthUrl();
    }

    res.json({
      success: true,
      data: {
        providers: {
          google: oauthService.isGoogleConfigured(),
          github: oauthService.isGitHubConfigured(),
        },
        urls,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth callback
export const googleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new ValidationError('Authorization code is required');
    }

    if (!oauthService.isGoogleConfigured()) {
      throw new AuthenticationError('Google OAuth is not configured');
    }

    // Exchange code for tokens
    const { accessToken } = await oauthService.exchangeGoogleCode(code);

    // Get user info from Google
    const googleUser = await oauthService.getGoogleUserInfo(accessToken);

    if (!googleUser.email) {
      throw new AuthenticationError('Could not get email from Google');
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
    });

    if (user) {
      // Update OAuth info if user exists but used different auth method
      if (user.authProvider === AuthProvider.LOCAL) {
        // Link Google account to existing user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            authProvider: AuthProvider.GOOGLE,
            providerId: googleUser.id,
            avatarUrl: googleUser.avatarUrl || user.avatarUrl,
            providerData: googleUser.rawData,
            emailVerified: true, // Google emails are verified
          },
        });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email.toLowerCase(),
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          avatarUrl: googleUser.avatarUrl,
          authProvider: AuthProvider.GOOGLE,
          providerId: googleUser.id,
          providerData: googleUser.rawData,
          emailVerified: true,
        },
      });
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
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
        token,
        isNewUser: !user.lastLoginAt,
      },
    });
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    if (error.message.includes('Failed to')) {
      next(new AuthenticationError('Google authentication failed. Please try again.'));
    } else {
      next(error);
    }
  }
};

// GitHub OAuth callback
export const githubCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new ValidationError('Authorization code is required');
    }

    if (!oauthService.isGitHubConfigured()) {
      throw new AuthenticationError('GitHub OAuth is not configured');
    }

    // Exchange code for access token
    const accessToken = await oauthService.exchangeGitHubCode(code);

    // Get user info from GitHub
    const githubUser = await oauthService.getGitHubUserInfo(accessToken);

    if (!githubUser.email) {
      throw new AuthenticationError('Could not get email from GitHub. Please make sure your email is public or verified.');
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: githubUser.email.toLowerCase() },
    });

    if (user) {
      // Update OAuth info if user exists but used different auth method
      if (user.authProvider === AuthProvider.LOCAL) {
        // Link GitHub account to existing user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            authProvider: AuthProvider.GITHUB,
            providerId: githubUser.id,
            avatarUrl: githubUser.avatarUrl || user.avatarUrl,
            providerData: githubUser.rawData,
            emailVerified: true,
          },
        });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: githubUser.email.toLowerCase(),
          firstName: githubUser.firstName,
          lastName: githubUser.lastName,
          avatarUrl: githubUser.avatarUrl,
          authProvider: AuthProvider.GITHUB,
          providerId: githubUser.id,
          providerData: githubUser.rawData,
          emailVerified: true,
        },
      });
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
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
        token,
        isNewUser: !user.lastLoginAt,
      },
    });
  } catch (error: any) {
    console.error('GitHub OAuth error:', error);
    if (error.message.includes('Failed to')) {
      next(new AuthenticationError('GitHub authentication failed. Please try again.'));
    } else {
      next(error);
    }
  }
};
