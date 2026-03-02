import { Router } from 'express';
import { getPublicAffiliates, getCreditsPageAffiliates } from '../controllers/affiliates';

const router = Router();

router.get('/credits-page', getCreditsPageAffiliates);
router.get('/', getPublicAffiliates);

export default router;
