
import express from 'express';
import { createAdmin, deleteAdmin, getAllAdmins, getAdminProfile, updateAdminPermissions } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { Role } from '../models/user.model';

const router = express.Router();

// Middleware to check if user is SUPER_ADMIN
const isSuperAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== Role.SUPER_ADMIN) {
        return res.status(403).json({ error: 'Access denied: Super Admin only' });
    }
    next();
};

router.post('/', authenticate, isSuperAdmin, createAdmin);
router.get('/', authenticate, isSuperAdmin, getAllAdmins);
router.put('/:id/permissions', authenticate, isSuperAdmin, updateAdminPermissions);
router.delete('/:id', authenticate, isSuperAdmin, deleteAdmin);
router.get('/me', authenticate, getAdminProfile);

export default router;
