import { Router } from 'express';
import { celebrate } from "celebrate";
import { authenticate } from '../middleware/authenticate.js';
import { getCurrentUser, getAllUsers } from '../controllers/usersController.js';
import { getAllUserSchema } from "../validations/userValidatins.js";

const router = Router();

router.get('/me', authenticate, getCurrentUser);
router.get('/users', celebrate(getAllUserSchema), getAllUsers);

export default router;

