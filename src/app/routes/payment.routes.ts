import { Router, Request, Response, NextFunction } from 'express';
import { getPlans, subscribe, getMySubscription, getPendingSubscriptions, getPaymentHistory, approveSubscription, rejectSubscription } from '../controllers/payment.controller';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Admin check middleware
const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied: Admin only' });
    }
    next();
};

router.get('/plans', getPlans);
router.post('/subscribe', authenticate, subscribe);
router.get('/me', authenticate, getMySubscription);

// Admin Routes — protected
router.get('/admin/pending', authenticate, isAdmin, getPendingSubscriptions);
router.get('/admin/history', authenticate, isAdmin, getPaymentHistory);
router.post('/admin/:id/approve', authenticate, isAdmin, approveSubscription);
router.post('/admin/:id/reject', authenticate, isAdmin, rejectSubscription);

export default router;
