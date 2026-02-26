import express from 'express';
import { registerUser, loginUser, logoutUser, refreshUserSession } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';



const authRouter = express.Router();
//ПУБЛІЧНИЙ ендпоінт реєстрації користувача
authRouter.post('/auth/register', registerUser);

//ПУБЛІЧНИЙ ендпоінт логінізації користувача
authRouter.post('/auth/login', loginUser);

//ПРИВАТНИЙ ендпоінт для логаута користувача
authRouter.post('/auth/logout', authenticate, logoutUser);

//ПРИВАТНИЙ ендпоінт для оновлення сесії користувача
authRouter.post('/auth/session', authenticate, refreshUserSession);

export default authRouter;
