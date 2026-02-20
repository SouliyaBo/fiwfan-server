import express from 'express';
import { preSignedUrl } from '../files';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/presign-url', authenticate, preSignedUrl);

export default router;