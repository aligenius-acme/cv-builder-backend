import { Router } from 'express';
import authRoutes from './auth';
import resumeRoutes from './resume';
import coverLetterRoutes from './coverLetter';
import adminRoutes from './admin';
import templateRoutes from './templates';
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
import aiFeaturesRoutes from './aiFeatures';
import uploadRoutes from './upload';
import monitoringRoutes from './monitoring';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/cover-letters', coverLetterRoutes);
router.use('/admin', adminRoutes);
router.use('/templates', templateRoutes);
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
router.use('/ai-features', aiFeaturesRoutes);
router.use('/upload', uploadRoutes);
router.use('/monitoring', monitoringRoutes);

export default router;
