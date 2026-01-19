"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agency_controller_1 = require("../controllers/agency.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', agency_controller_1.getAgencies);
// Specific routes
router.get('/me', auth_middleware_1.authenticate, agency_controller_1.getMyAgency);
router.patch('/me', auth_middleware_1.authenticate, agency_controller_1.updateAgencyProfile);
router.post('/me/kyc', auth_middleware_1.authenticate, agency_controller_1.submitKYC); // NEW: Submit KYC
// Approval Routes
router.post('/requests/:creatorId/approve', auth_middleware_1.authenticate, agency_controller_1.approveCreator);
router.post('/requests/:creatorId/reject', auth_middleware_1.authenticate, agency_controller_1.rejectCreator);
// Admin Routes (Should use admin middleware in real app, simply auth check + role check in controller for now)
router.get('/admin/pending', auth_middleware_1.authenticate, agency_controller_1.getPendingAgencies);
router.post('/admin/:id/verify', auth_middleware_1.authenticate, agency_controller_1.verifyAgency);
router.post('/admin/:id/reject', auth_middleware_1.authenticate, agency_controller_1.rejectAgency);
router.get('/:id', agency_controller_1.getAgencyById);
router.post('/', agency_controller_1.createAgency);
exports.default = router;
