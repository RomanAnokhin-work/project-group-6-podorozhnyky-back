import { Router } from 'express';
import { celebrate } from 'celebrate';
import { getStories } from '../controllers/storiesController.js';
import { getStoriesSchema } from '../validations/storiesValidation.js';

const router = Router();

router.get('/stories', celebrate(getStoriesSchema), getStories);

export default router;
