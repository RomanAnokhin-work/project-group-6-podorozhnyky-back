import express from 'express';
import { registerUser, loginUser, logoutUser, refreshUserSession } from '../controllers/authController.js';



const authRouter = express.Router();

authRouter.post('/auth/register', registerUser);
authRouter.post('/auth/login', loginUser);
authRouter.post('/auth/logout', logoutUser);
authRouter.post('/auth/session', refreshUserSession);

export default authRouter;
