import createHttpError from 'http-errors';
import { Category } from '../models/category.js';

export const getCategories = async (req, res) => {
  const categories = await Category.find();
  res.status(200).json(categories);
};
