import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { updateProfile, getProfile, getUsers, updateUserStatus } from '../controllers/user.controller';

import { getUserDashboardStats } from '../controllers/dashboard.controller';
import { toggleFavorite, recordView, getHistory, getMyFavorites, updatePreferences } from '../controllers/user.controller';

const router = Router();

router.get('/', authenticate, getUsers);
router.patch('/:id/status', authenticate, updateUserStatus);

router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, updateProfile);
router.patch('/me/preferences', authenticate, updatePreferences);
router.get('/me/dashboard', authenticate, getUserDashboardStats);
router.post('/favorites', authenticate, toggleFavorite);
router.get('/favorites', authenticate, getMyFavorites);
router.post('/views', authenticate, recordView);
router.get('/history', authenticate, getHistory);

export default router;
