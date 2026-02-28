import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import {
  getCurrentUser,
  getAllUsers,
  updateCurrentUserController,
  getUserById,
  verifyEmailController,
  getPopularUsers,
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

//ПУБЛІЧНИЙ ендпоінт на ОТРИМАННЯ даних про користувачів(авторів) + пагінація
usersRouter.get('/users', celebrate(getAllUserSchema), getAllUsers);

// ПУБЛІЧНИЙ ендпоінт на ОТРИМАННЯ ТОП-4 популярних мандрівників
usersRouter.get('/users/popular-users', getPopularUsers);

//ПРИВАТНИЙ ендпоінт на ОТРИМАННЯ інформації про поточного користувача
usersRouter.get('/users/me', authenticate, getCurrentUser);

//ПУБЛІЧНИЙ ендпоінт на ОТРИМАННЯ даних про користувача за ID - дані користувача + список статей
usersRouter.get(
  '/users/:userId',
  celebrate(userIdParamSchema),
  ctrlWrapper(getUserById),
);

//ПРИВАТНИЙ ендпоінт для ОНОВЛЕННЯ аватару корситувача
// ПРИВАТНИЙ ендпоінт для ОНОВЛЕННЯ даних користувача
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
