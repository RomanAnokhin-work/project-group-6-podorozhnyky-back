import express from 'express';
import { registerUser, loginUser, logoutUser, refreshUserSession, resetPassword, requestResetEmail  } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { celebrate } from 'celebrate';
import {  requestResetEmailSchema, resetPasswordSchema } from '../validations/authValidation.js';



const authRouter = express.Router();
//ПУБЛІЧНИЙ ендпоінт реєстрації користувача
authRouter.post('/auth/register', registerUser);

//ПУБЛІЧНИЙ ендпоінт логінізації користувача
authRouter.post('/auth/login', loginUser);

//ПРИВАТНИЙ ендпоінт для логаута користувача
authRouter.post('/auth/logout', authenticate, logoutUser);

//ПРИВАТНИЙ ендпоінт для оновлення сесії користувача
authRouter.post('/auth/session', refreshUserSession);

//ПУБЛІЧНИЙ ендпоінт для зміни пошти
authRouter.post('/auth/request-reset-email', celebrate(requestResetEmailSchema), requestResetEmail);

//ПУБЛІЧНИЙ ендпоінт для зміни паролю
authRouter.post('/auth/reset-password', celebrate(resetPasswordSchema), resetPassword);


export default authRouter;
