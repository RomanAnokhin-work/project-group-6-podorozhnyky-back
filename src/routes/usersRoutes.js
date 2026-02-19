import { celebrate } from "celebrate";
import { Router } from "express";
import { getAllUserSchema } from "../validations/userValidatins.js";
import { getAllUsers } from "../controllers/usersController.js";

const router = Router();

router.get('/users', celebrate(getAllUserSchema), getAllUsers);

export default router;