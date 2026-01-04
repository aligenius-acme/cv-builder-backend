import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createOrganization,
  getOrganization,
  updateOrganization,
  inviteMember,
  acceptInvite,
  removeMember,
  updateMemberRole,
  leaveOrganization,
} from '../controllers/organization';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Organization CRUD
router.post('/', createOrganization);
router.get('/', getOrganization);
router.put('/', updateOrganization);

// Member management
router.post('/invite', inviteMember);
router.post('/accept-invite', acceptInvite);
router.delete('/members/:memberId', removeMember);
router.put('/members/:memberId/role', updateMemberRole);
router.post('/leave', leaveOrganization);

export default router;
