import express from 'express';
import { getSettings, updateSetting, getLocations } from '../controllers/setting.controller';

const router = express.Router();

router.get('/locations', getLocations);
router.get('/', getSettings);
router.post('/', updateSetting); // Use POST to create/update
router.put('/', updateSetting);

export default router;
