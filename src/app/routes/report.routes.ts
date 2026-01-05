import express from 'express';
import { createReport, getReports, updateReportStatus } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, createReport);
router.get('/', authenticate, getReports);
router.patch('/:id', authenticate, updateReportStatus);

export default router;
