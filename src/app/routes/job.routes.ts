import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { createJob, getJobs, getMyJobs, updateJob } from '../controllers/job.controller';

const router = Router();

// Public/Creator view (Optional Auth so we can show to guests too?)
// Requirement says "visible just for Creators?". Implementation Plan said "Maybe everyone".
// Let's stick to optionalAuthenticate or just Public for list, Authenticate for Create.
router.get('/', optionalAuthenticate, getJobs);

router.post('/', authenticate, createJob);
router.get('/me', authenticate, getMyJobs);
router.put('/:id', authenticate, updateJob);

export default router;
