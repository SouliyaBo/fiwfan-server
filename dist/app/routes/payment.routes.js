"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Admin check middleware
const isAdmin = (req, res, next) => {
    if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied: Admin only' });
    }
    next();
};
router.get('/plans', payment_controller_1.getPlans);
router.post('/subscribe', auth_middleware_1.authenticate, payment_controller_1.subscribe);
router.get('/me', auth_middleware_1.authenticate, payment_controller_1.getMySubscription);
// Admin Routes — protected
router.get('/admin/pending', auth_middleware_1.authenticate, isAdmin, payment_controller_1.getPendingSubscriptions);
router.get('/admin/history', auth_middleware_1.authenticate, isAdmin, payment_controller_1.getPaymentHistory);
router.post('/admin/:id/approve', auth_middleware_1.authenticate, isAdmin, payment_controller_1.approveSubscription);
router.post('/admin/:id/reject', auth_middleware_1.authenticate, isAdmin, payment_controller_1.rejectSubscription);
exports.default = router;
