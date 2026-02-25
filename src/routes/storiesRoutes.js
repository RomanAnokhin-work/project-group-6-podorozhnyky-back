import { Router } from 'express';
import { celebrate } from 'celebrate';
import { getStories, getOwnStories, createStory, updateStory, getSavedStoriesController,addArticleToSaved,
  removeArticleFromSaved,} from '../controllers/storiesController.js';
import {
  getStoriesSchema,
  getOwnStoriesSchema,
  createStorySchema,
  updateStorySchema,
  paginationQuerySchema,
  updateSavedArticlesSchema,
} from '../validations/storiesValidation.js';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/multer.js';

const storiesRouter = Router();

storiesRouter.get('/stories', celebrate(getStoriesSchema), getStories);
storiesRouter.get('/stories/own', authenticate, celebrate(getOwnStoriesSchema), getOwnStories);

storiesRouter.post(
  '/stories',
  authenticate,
  upload.single('img'),
  celebrate(createStorySchema),
  createStory,
);

storiesRouter.patch(
  '/stories/:storyId',
  authenticate,
  upload.single('img'),
  celebrate(updateStorySchema),
  updateStory,
);

storiesRouter.get(
  '/stories/saved',
  authenticate,
  celebrate(paginationQuerySchema),
  getSavedStoriesController,
);

storiesRouter.patch(
  '/stories/saved',
  authenticate,
  celebrate(updateSavedArticlesSchema),
  addArticleToSaved,
);

storiesRouter.delete(
  '/stories/saved',
  authenticate,
  celebrate(updateSavedArticlesSchema),
  removeArticleFromSaved,
);

export default storiesRouter;
