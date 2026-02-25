"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const setting_controller_1 = require("../controllers/setting.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Public routes
router.get('/locations', setting_controller_1.getLocations);
router.get('/', setting_controller_1.getSettings);
// Protected routes — require admin permission
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requirePermission)('manage_settings'), setting_controller_1.updateSetting);
router.put('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requirePermission)('manage_settings'), setting_controller_1.updateSetting);
exports.default = router;
