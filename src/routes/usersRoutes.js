import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import {
  getCurrentUser,
  getAllUsers,
  updateCurrentUserController,
  getUserById,
  addArticleToSaved,
  removeArticleFromSaved,
} from '../controllers/usersController.js';
import {
  getAllUserSchema,
  updateSavedArticlesSchema,
  updateUserSchema,
  userIdParamSchema,
} from '../validations/userValidation.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middleware/validateBody.js';
import { upload } from '../middleware/multer.js';

const usersRouter = Router();
usersRouter.get('/me', authenticate, getCurrentUser);
usersRouter.get('/users', celebrate(getAllUserSchema), getAllUsers);
usersRouter.get(
  '/users/:userId',
  celebrate(userIdParamSchema),
  ctrlWrapper(getUserById),
);

usersRouter.patch(
  '/me',
  authenticate,
  //upload.single('avatar'),
  validateBody(updateUserSchema),
  ctrlWrapper(updateCurrentUserController),
);

usersRouter.patch(
  '/me/saved-articles',
  authenticate,
  celebrate(updateSavedArticlesSchema),
  addArticleToSaved,
);

usersRouter.delete(
  '/me/saved-articles',
  authenticate,
  celebrate(updateSavedArticlesSchema),
  removeArticleFromSaved,
);

export default usersRouter;
