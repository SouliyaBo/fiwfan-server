import express from 'express';
import { preSignedUrl } from '../files';

const router = express.Router();

router.post('/presign-url', preSignedUrl);

export default router;