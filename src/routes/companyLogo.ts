import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCompanyLogo,
  getCompanyLogos,
  verifyLogo,
} from '../controllers/companyLogo';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get logo for a single company
router.get('/:company', getCompanyLogo);

// Verify if logo exists
router.get('/:company/verify', verifyLogo);

// Get logos for multiple companies (batch)
router.post('/batch', getCompanyLogos);

export default router;
