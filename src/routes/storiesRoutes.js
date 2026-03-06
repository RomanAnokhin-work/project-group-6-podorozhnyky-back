import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  getStories,
  getOwnStories,
  createStory,
  updateStory,
  getSavedStoriesController,
  addArticleToSaved,
  removeArticleFromSaved,
  getPopularStories,getStoryByIdController,
  deleteStoryById,
} from '../controllers/storiesController.js';
import {
  getStoriesSchema,
  getOwnStoriesSchema,
  createStorySchema,
  updateStorySchema,
  paginationQuerySchema,
  updateSavedArticlesSchema,
  getPopularStoriesSchema,
} from '../validations/storiesValidation.js';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/multer.js';

const storiesRouter = Router();

//ПУБЛІЧНИЙ ендпоінт для ОТРИМАННЯ історій + пагінація + фільтрація за категоріями
storiesRouter.get('/stories', celebrate(getStoriesSchema), getStories);

// ПРИВАТНИЙ ендпоінт для ДОДАВАННЯ статті до збережених статей користувача
storiesRouter.patch(
  '/stories/saved',
  authenticate,
  celebrate(updateSavedArticlesSchema),
  addArticleToSaved,
);

//ПРИВАТНИЙ ендпоінт для ВИДАЛЕННЯ статті зі збережених статей користувача
storiesRouter.delete(
  '/stories/saved',
  authenticate,
  celebrate(updateSavedArticlesSchema),
  removeArticleFromSaved,
);

//ПРИВАТНИЙ ендпоінт для ОТРИМАННЯ збережених історій + пагінація
storiesRouter.get(
  '/stories/saved',
  authenticate,
  celebrate(paginationQuerySchema),
  getSavedStoriesController,
);

//ПРИВАТНИЙ ендпоінт для ОТРИМАННЯ власних історій користувача(автора) + пагінація
storiesRouter.get(
  '/stories/own',
  authenticate,
  celebrate(getOwnStoriesSchema),
  getOwnStories,
);

//ПРИВАТНИЙ ендпоінт для СТВОРЕННЯ історії
storiesRouter.post(
  '/stories',
  authenticate,
  upload.single('img'),
  celebrate(createStorySchema),
  createStory,
);

//ПРИВАТНИЙ ендпоінт для РЕДАГУВАННЯ історії
storiesRouter.patch(
  '/stories/:storyId',
  authenticate,
  upload.single('img'),
  celebrate(updateStorySchema),
  updateStory,
);

//ПУБЛІЧНИЙ ендпоінт для ОТРИМАННЯ популярних історій
storiesRouter.get(
  '/stories/popular',
  celebrate(getPopularStoriesSchema),
  getPopularStories,
);

//ПУБЛІЧНИЙ ендпоінт для ОТРИМАННЯ історії за ID
storiesRouter.get('/stories/:storyId', getStoryByIdController);

storiesRouter.delete('/stories/:storyId', authenticate, deleteStoryById);
export default storiesRouter;
