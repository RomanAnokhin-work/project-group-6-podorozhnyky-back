import { Router } from 'express';
import { celebrate } from "celebrate";
import { authenticate } from '../middleware/authenticate.js';
import { getCurrentUser, getAllUsers, updateCurrentUserController} from '../controllers/usersController.js';
import { getAllUserSchema, updateUserSchema} from "../validations/userValidation.js";
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { upload } from '../middleware/upload.js';

const router = Router();
const usersRouter = Router();
router.get('/me', authenticate, getCurrentUser);
router.get('/users', celebrate(getAllUserSchema), getAllUsers);

usersRouter.patch(
  '/me',
  authenticate,
  upload.single('avatar'),
  validateBody(updateUserSchema),
  ctrlWrapper(updateCurrentUserController),
);

export default router;

