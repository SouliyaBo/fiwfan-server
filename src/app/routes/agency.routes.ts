
import { Router } from 'express';
import { getAgencies, getAgencyById, createAgency, getMyAgency, updateAgencyProfile, approveCreator, rejectCreator, submitKYC, verifyAgency, getPendingAgencies, rejectAgency } from '../controllers/agency.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getAgencies);
// Specific routes
router.get('/me', authenticate, getMyAgency);
router.patch('/me', authenticate, updateAgencyProfile);
router.post('/me/kyc', authenticate, submitKYC); // NEW: Submit KYC

// Approval Routes
router.post('/requests/:creatorId/approve', authenticate, approveCreator);
router.post('/requests/:creatorId/reject', authenticate, rejectCreator);

// Admin Routes (Should use admin middleware in real app, simply auth check + role check in controller for now)
router.get('/admin/pending', authenticate, getPendingAgencies);
router.post('/admin/:id/verify', authenticate, verifyAgency);
router.post('/admin/:id/reject', authenticate, rejectAgency);

router.get('/:id', getAgencyById);
router.post('/', createAgency);

export default router;
