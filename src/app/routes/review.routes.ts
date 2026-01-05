import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createReview, getReviewsByCreator, getMyReviews, getAllReviews } from '../controllers/review.controller';

const router = Router();

router.get('/', getAllReviews);
router.post('/', authenticate, createReview);
router.get('/me', authenticate, getMyReviews);
router.get('/creator/:creatorId', getReviewsByCreator);

export default router;
