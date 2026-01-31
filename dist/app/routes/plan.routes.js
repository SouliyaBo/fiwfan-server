"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const plan_controller_1 = require("../controllers/plan.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes (or arguably authenticated, but for now allow public to see plans)
router.get('/', plan_controller_1.getAllPlans);
// Admin routes
router.post('/', auth_middleware_1.authenticate, plan_controller_1.createPlan);
router.put('/:id', auth_middleware_1.authenticate, plan_controller_1.updatePlan);
router.delete('/:id', auth_middleware_1.authenticate, plan_controller_1.deletePlan);
exports.default = router;
