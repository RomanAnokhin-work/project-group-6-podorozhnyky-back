import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getCurrentUser } from '../controllers/usersController.js';

const router = Router();

router.get('/me', authenticate, getCurrentUser);

export default router;
