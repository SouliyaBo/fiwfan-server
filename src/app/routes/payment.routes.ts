import { Router } from 'express';
import { getPlans, subscribe, getMySubscription, getPendingSubscriptions, approveSubscription, rejectSubscription } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/plans', getPlans);
router.post('/subscribe', authenticate, subscribe);
router.get('/me', authenticate, getMySubscription);

// Admin Routes
router.get('/admin/pending', authenticate, getPendingSubscriptions);
router.post('/admin/:id/approve', authenticate, approveSubscription);
router.post('/admin/:id/reject', authenticate, rejectSubscription);

export default router;
