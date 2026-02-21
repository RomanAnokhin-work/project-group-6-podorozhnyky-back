import { Router } from 'express';
import { celebrate } from 'celebrate';
import { getStories, getOwnStories, createStory, updateStory } from '../controllers/storiesController.js';
import {
  getStoriesSchema,
  getOwnStoriesSchema,
  createStorySchema,
  updateStorySchema,
} from '../validations/storiesValidation.js';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/multer.js';

const router = Router();

router.get('/stories', celebrate(getStoriesSchema), getStories);
router.get('/stories/own', authenticate, celebrate(getOwnStoriesSchema), getOwnStories);

router.post(
  '/stories',
  authenticate,
  upload.single('img'),
  celebrate(createStorySchema),
  createStory,
);

router.patch(
  '/stories/:storyId',
  authenticate,
  upload.single('img'),
  celebrate(updateStorySchema),
  updateStory,
);

export default router;
