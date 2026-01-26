import { Router } from 'express';
import { getAllPlans, createPlan, updatePlan, deletePlan } from '../controllers/plan.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes (or arguably authenticated, but for now allow public to see plans)
router.get('/', getAllPlans);

// Admin routes
router.post('/', authenticate, createPlan);
router.put('/:id', authenticate, updatePlan);
router.delete('/:id', authenticate, deletePlan);

export default router;
