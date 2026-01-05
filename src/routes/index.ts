import { Router } from 'express';
import authRoutes from './auth';
import resumeRoutes from './resume';
import coverLetterRoutes from './coverLetter';
import subscriptionRoutes from './subscription';
import adminRoutes from './admin';
import templateRoutes from './templates';
import organizationRoutes from './organization';
import shareRoutes from './share';
import aiWritingRoutes from './aiWriting';
import interviewPrepRoutes from './interviewPrep';
import salaryAnalyzerRoutes from './salaryAnalyzer';
import jobBoardRoutes from './jobBoard';
import jobTrackerRoutes from './jobTracker';
import careerToolsRoutes from './careerTools';
import abTestingRoutes from './abTesting';
import oauthRoutes from './oauth';
import grammarRoutes from './grammar';
import companyLogoRoutes from './companyLogo';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/cover-letters', coverLetterRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/admin', adminRoutes);
router.use('/templates', templateRoutes);
router.use('/organization', organizationRoutes);
router.use('/shared', shareRoutes);
router.use('/ai-writing', aiWritingRoutes);
router.use('/interview-prep', interviewPrepRoutes);
router.use('/salary', salaryAnalyzerRoutes);
router.use('/jobs', jobBoardRoutes);
router.use('/job-tracker', jobTrackerRoutes);
router.use('/career', careerToolsRoutes);
router.use('/ab-tests', abTestingRoutes);
router.use('/oauth', oauthRoutes);
router.use('/grammar', grammarRoutes);
router.use('/company-logos', companyLogoRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
