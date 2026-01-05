import express from 'express';
import { createStory, getStories, getMyStories, deleteStory } from '../controllers/story.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', getStories); // Public feed of stories? Or protected? Let's make it public for now or verifyToken if needed.
// Actually, usually viewing stories might require login depending on app logic. Let's leave it open but frontend can enforce.
// To keep it simple:
router.get('/feed', getStories);

router.post('/', authenticate, createStory);
router.get('/me', authenticate, getMyStories);
router.delete('/:id', authenticate, deleteStory);

export default router;
