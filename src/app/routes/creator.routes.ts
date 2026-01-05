import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
// Add updateProfile import if not already exported, but it is in controller.
import { getCreators, getCreatorById, updateCreatorProfile, getRecommendedCreators, getZoneStats, updateCreatorVerification } from '../controllers/creator.controller';

const router = Router();

router.get('/', optionalAuthenticate, getCreators);
router.get('/zones', getZoneStats);
router.get('/recommended', getRecommendedCreators);
router.patch('/me', authenticate, updateCreatorProfile);
router.patch('/:id/verification', authenticate, updateCreatorVerification);
router.get('/:id', getCreatorById);

export default router;
