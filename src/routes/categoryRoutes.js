import express from 'express';
import { getCategories } from '../controllers/categoryController.js';

const categoryRouter = express.Router();

categoryRouter.get('/categories', getCategories);

export default categoryRouter;
