"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
// Add updateProfile import if not already exported, but it is in controller.
const creator_controller_1 = require("../controllers/creator.controller");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.optionalAuthenticate, creator_controller_1.getCreators);
router.get('/zones', creator_controller_1.getZoneStats);
router.get('/recommended', creator_controller_1.getRecommendedCreators);
router.patch('/me', auth_middleware_1.authenticate, creator_controller_1.updateCreatorProfile);
router.post('/me/kyc', auth_middleware_1.authenticate, creator_controller_1.submitKyc);
router.get('/me/kyc', auth_middleware_1.authenticate, creator_controller_1.getKycStatus);
router.patch('/:id/verification', auth_middleware_1.authenticate, creator_controller_1.updateCreatorVerification);
router.get('/:id', creator_controller_1.getCreatorById);
exports.default = router;
