"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const job_controller_1 = require("../controllers/job.controller");
const router = (0, express_1.Router)();
// Public/Creator view (Optional Auth so we can show to guests too?)
// Requirement says "visible just for Creators?". Implementation Plan said "Maybe everyone".
// Let's stick to optionalAuthenticate or just Public for list, Authenticate for Create.
router.get('/', auth_middleware_1.optionalAuthenticate, job_controller_1.getJobs);
router.post('/', auth_middleware_1.authenticate, job_controller_1.createJob);
router.get('/me', auth_middleware_1.authenticate, job_controller_1.getMyJobs);
router.put('/:id', auth_middleware_1.authenticate, job_controller_1.updateJob);
router.delete('/:id', auth_middleware_1.authenticate, job_controller_1.deleteJob);
exports.default = router;
