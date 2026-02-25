import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import {
  getCurrentUser,
  getAllUsers,
  updateCurrentUserController,
  getUserById,
  verifyEmailController,
} from '../controllers/usersController.js';
import {
  getAllUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from '../validations/userValidation.js';
import { emailVerificationSchema } from '../validations/userValidation.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middleware/validateBody.js';
import { upload } from '../middleware/multer.js';

const usersRouter = Router();
usersRouter.get('/users/me', authenticate, getCurrentUser);
usersRouter.get('/users', celebrate(getAllUserSchema), getAllUsers);
usersRouter.get(
  '/users/:userId',
  celebrate(userIdParamSchema),
  ctrlWrapper(getUserById),
);

usersRouter.patch(
  '/users/me',
  authenticate,
  upload.single('avatar'),
  validateBody(updateUserSchema),
  ctrlWrapper(updateCurrentUserController),
);

usersRouter.get(
  '/users/verify-email',
  celebrate(emailVerificationSchema),
  ctrlWrapper(verifyEmailController),
);



export default usersRouter;
