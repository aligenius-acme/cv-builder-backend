import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { checkResumeQuota, checkATSSimulatorAccess } from '../middleware/subscription';
import {
  uploadResume,
  getResumes,
  getResume,
  updateResume,
  deleteResume,
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

// Resume CRUD
router.post('/', checkResumeQuota, upload.single('file'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);

// Resume Builder
router.post('/create', checkResumeQuota, createBlankResume);
router.put('/:id/content', updateResumeContent);
router.get('/:id/download', downloadResume);
router.get('/:id/preview', previewResume);

// Resume customization
router.post('/:id/customize', customizeResume);

// Job URL scraping
router.post('/scrape-job', scrapeJobUrl);

// Version operations
router.get('/:id/versions/:versionId', getVersion);
router.get('/:id/compare', compareVersions);
router.get('/:id/versions/:versionId/download', downloadVersion);

// ATS simulation (Pro feature)
router.post('/:id/versions/:versionId/simulate-ats', checkATSSimulatorAccess, simulateATS);

export default router;
