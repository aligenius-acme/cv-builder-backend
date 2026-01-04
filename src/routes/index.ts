import { Router } from 'express';
import authRoutes from './auth';
import resumeRoutes from './resume';
import coverLetterRoutes from './coverLetter';
import subscriptionRoutes from './subscription';
import adminRoutes from './admin';
import templateRoutes from './templates';
import organizationRoutes from './organization';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/cover-letters', coverLetterRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/admin', adminRoutes);
router.use('/templates', templateRoutes);
router.use('/organization', organizationRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
