import { Router } from 'express';
import { celebrate } from 'celebrate';
import { getStories, getOwnStories } from '../controllers/storiesController.js';
import { getStoriesSchema, getOwnStoriesSchema } from '../validations/storiesValidation.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/stories', celebrate(getStoriesSchema), getStories);
router.get('/stories/own', authenticate, celebrate(getOwnStoriesSchema), getOwnStories);

export default router;
