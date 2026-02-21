import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js';
import auth from '../middlewares/auth.js';


const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', auth, logoutUser);

export default authRouter;
