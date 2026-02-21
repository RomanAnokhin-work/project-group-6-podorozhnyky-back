import createHttpError from 'http-errors';
import { Category } from '../models/category.js';
import { Traveller } from '../models/traveller.js';

export const getStories = async (req, res) => {
  const { page = 1, perPage = 10, category } = req.query;

  let filter = {};

  if (category) {
    const foundCategory = await Category.findOne({ name: category });
    if (!foundCategory) {
      throw createHttpError(404, 'No such category');
    }
    filter.category = foundCategory._id;
  }

  const skip = (page - 1) * perPage;

  const storiesQuery = Traveller.find(filter).populate('category');

  const [totalItems, stories] = await Promise.all([
    storiesQuery.clone().countDocuments(),
    storiesQuery.skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    page,
    perPage,
    totalItems,
    totalPages,
    stories,
  });
};

export const getOwnStories = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(perPage);

  const filter = { ownerId: req.user._id };
  const storiesQuery = Traveller.find(filter).populate('category');

  const [totalItems, stories] = await Promise.all([
    storiesQuery.clone().countDocuments(),
    storiesQuery.skip(skip).limit(Number(perPage)),
  ]);

  const totalPages = Math.ceil(totalItems / Number(perPage));

  res.status(200).json({
    page: Number(page),
    perPage: Number(perPage),
    totalItems,
    totalPages,
    stories,
  });
};
