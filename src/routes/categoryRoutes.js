import express from 'express';
import { getCategories } from '../controllers/categoryController.js';

const categoryRouter = express.Router();

//ПУБЛІЧНИЙ ендпоінт для отримання списку категорій
categoryRouter.get('/categories', getCategories);

export default categoryRouter;
