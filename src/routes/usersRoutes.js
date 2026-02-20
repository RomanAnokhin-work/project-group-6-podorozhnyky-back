import { Router } from 'express';
import { celebrate } from "celebrate";
import { authenticate } from '../middleware/authenticate.js';
import { getCurrentUser, getAllUsers, updateCurrentUserController} from '../controllers/usersController.js';
import { getAllUserSchema, updateUserSchema} from "../validations/userValidation.js";
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middleware/validateBody.js';
import { upload } from '../middleware/multer.js';

const usersRouter = Router();
usersRouter.get('/me', authenticate, getCurrentUser);
usersRouter.get('/users', celebrate(getAllUserSchema), getAllUsers);

usersRouter.patch(
  '/me',
  authenticate,
  upload.single('avatar'),
  validateBody(updateUserSchema),
  ctrlWrapper(updateCurrentUserController),
);

export default usersRouter;
