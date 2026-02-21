import createHttpError from 'http-errors';
import { Category } from '../models/category.js';
import { Traveller } from '../models/traveller.js';
import { saveFileToCloudinary } from '../services/cloudinaryService.js';

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

export const createStory = async (req, res) => {
  const { title, article, category } = req.body;
  const image = req.file;

  if (!image) {
    throw createHttpError(400, 'Story image is required');
  }

  const uploadResult = await saveFileToCloudinary(image.buffer);
  const imgUrl = uploadResult.secure_url;

  const foundCategory = await Category.findById(category);
  if (!foundCategory) {
    throw createHttpError(404, 'No such category');
  }

  const story = await Traveller.create({
    title,
    article,
    img: imgUrl,
    date: new Date().toISOString().slice(0, 10),
    category: foundCategory._id,
    ownerId: req.user._id,
    favoriteCount: 0,
  });

  res.status(201).json(story);
};

export const updateStory = async (req, res) => {
  const { storyId } = req.params;
  const { title, article, category } = req.body;
  const image = req.file;

  const updateData = {};
  if (title) updateData.title = title;
  if (article) updateData.article = article;
  if (category) updateData.category = category;

  if (image) {
    const uploadResult = await saveFileToCloudinary(image.buffer);
    updateData.img = uploadResult.secure_url;
  }

  const updatedStory = await Traveller.findByIdAndUpdate(
    storyId,
    updateData,
    { new: true },
  );

  if (!updatedStory) {
    throw createHttpError(404, 'Story not found');
  }

  res.status(200).json(updatedStory);
};


