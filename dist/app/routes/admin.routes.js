"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_model_1 = require("../models/user.model");
const router = express_1.default.Router();
// Middleware to check if user is SUPER_ADMIN
const isSuperAdmin = (req, res, next) => {
    if (req.user.role !== user_model_1.Role.SUPER_ADMIN) {
        return res.status(403).json({ error: 'Access denied: Super Admin only' });
    }
    next();
};
router.post('/', auth_middleware_1.authenticate, isSuperAdmin, admin_controller_1.createAdmin);
router.get('/', auth_middleware_1.authenticate, isSuperAdmin, admin_controller_1.getAllAdmins);
router.put('/:id/permissions', auth_middleware_1.authenticate, isSuperAdmin, admin_controller_1.updateAdminPermissions);
router.delete('/:id', auth_middleware_1.authenticate, isSuperAdmin, admin_controller_1.deleteAdmin);
router.get('/me', auth_middleware_1.authenticate, admin_controller_1.getAdminProfile);
exports.default = router;
