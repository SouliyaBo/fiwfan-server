import express from 'express';
import { getSettings, updateSetting, getLocations } from '../controllers/setting.controller';
import { authenticate, requirePermission } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/locations', getLocations);
router.get('/', getSettings);

// Protected routes — require admin permission
router.post('/', authenticate, requirePermission('manage_settings'), updateSetting);
router.put('/', authenticate, requirePermission('manage_settings'), updateSetting);

export default router;
