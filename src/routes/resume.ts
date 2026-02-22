import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import {
  uploadResume,
  getResumes,
  getResume,
  updateResume,
  deleteResume,
  deleteVersion,
  downloadOriginalResume,
  customizeResume,
  getVersion,
  compareVersions,
  downloadVersion,
  simulateATS,
  scrapeJobUrl,
  createBlankResume,
  updateResumeContent,
  downloadResume,
  previewResume,
} from '../controllers/resume';
import { uploadLimiter, aiLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import { resumeUpdateSchema, resumeTailoringSchema } from '../validation/schemas';
import { checkAICredits } from '../middleware/credits';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and image files (JPG, PNG, WebP) are allowed'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// Resume CRUD with rate limiting
router.post('/', uploadLimiter, upload.single('file'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.put('/:id', validateBody(resumeUpdateSchema), updateResume);
router.delete('/:id', deleteResume);
router.get('/:id/download-original', downloadOriginalResume);

// Resume Builder
router.post('/create', createBlankResume);
router.put('/:id/content', updateResumeContent);
router.get('/:id/download', downloadResume);
router.get('/:id/preview', previewResume);

// Resume customization (AI-powered, rate limited, credit checked)
router.post('/:id/customize', aiLimiter, checkAICredits, customizeResume);

// Job URL scraping (rate limited to prevent abuse)
router.post('/scrape-job', aiLimiter, scrapeJobUrl);

// Version operations
router.get('/:id/versions/:versionId', getVersion);
router.get('/:id/compare', compareVersions);
router.get('/:id/versions/:versionId/download', downloadVersion);
router.delete('/:id/versions/:versionId', deleteVersion);

// ATS simulation (AI-powered, rate limited, credit checked)
router.post('/:id/versions/:versionId/simulate-ats', aiLimiter, checkAICredits, simulateATS);

export default router;
