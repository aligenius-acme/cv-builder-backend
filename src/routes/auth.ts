import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  register,
  login,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  getCredits,
} from '../controllers/auth';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
  updateProfileSchema,
} from '../validation/schemas';

const router = Router();

// Handle OAuth cancellation/errors — Google/GitHub redirect here with ?error=access_denied
router.get('/google/callback', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const error = req.query.error as string | undefined;
  res.redirect(`${frontendUrl}/auth/google/callback${error ? `?error=${encodeURIComponent(error)}` : ''}`);
});
router.get('/github/callback', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const error = req.query.error as string | undefined;
  res.redirect(`${frontendUrl}/auth/github/callback${error ? `?error=${encodeURIComponent(error)}` : ''}`);
});

// Public routes with rate limiting and validation
router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/forgot-password', passwordResetLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), resetPassword);
router.post('/verify-email', authLimiter, validateBody(verifyEmailSchema), verifyEmail);

// Protected routes with validation
router.get('/me', authenticate, me);
router.get('/credits', authenticate, getCredits);
router.put('/profile', authenticate, validateBody(updateProfileSchema), updateProfile);
router.put('/change-password', authenticate, validateBody(changePasswordSchema), changePassword);
router.post('/resend-verification', authenticate, authLimiter, resendVerification);

export default router;
