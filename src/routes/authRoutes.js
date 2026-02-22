import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js';



const authRouter = express.Router();

authRouter.post('/auth/register', registerUser);
authRouter.post('/auth/login', loginUser);
authRouter.post('/auth/logout', logoutUser);

export default authRouter;
