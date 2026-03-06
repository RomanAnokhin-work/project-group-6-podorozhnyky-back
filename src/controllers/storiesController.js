import createHttpError from 'http-errors';
import { Category } from '../models/category.js';
import { Story } from '../models/story.js';
import { saveFileToCloudinary } from '../services/cloudinaryService.js';
import { User } from '../models/user.js';
import { getStoryByIdService } from '../services/stories.js';
import mongoose from 'mongoose';


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

  const storiesQuery = Story.find(filter).populate(['category', 'ownerId']);

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
  const storiesQuery = Story.find(filter)
    .populate('category')
    .populate('ownerId', 'name avatarUrl');

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

  const story = await Story.create({
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

  const updatedStory = await Story.findByIdAndUpdate(storyId, updateData, {
    new: true,
  });

  if (!updatedStory) {
    throw createHttpError(404, 'Story not found');
  }

  res.status(200).json(updatedStory);
};

export const getSavedStoriesController = async (req, res) => {
  const { page = 1, limit = 9 } = req.query;
  const userId = req.user._id;

  const user = await User.findById(userId);

  const total = user.savedArticles.length;

  const skip = (Number(page) - 1) * Number(limit);

  const stories = await Story.find({
    _id: { $in: user.savedArticles },
  })
    .populate('ownerId', 'name avatarUrl')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    data: stories,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};
export const addArticleToSaved = async (req, res) => {
  const { articleId } = req.body;
  const userId = req.user._id;

  const articleExists = await Story.exists({ _id: articleId });

  if (!articleExists) {
    throw createHttpError(404, 'Article not found!');
  }

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: userId,
      savedArticles: { $ne: articleId },
    },
    {
      $addToSet: { savedArticles: articleId },
    },
    { new: true },
  ).populate('savedArticles');

  if (!updatedUser) {
    const user = await User.findById(userId).populate('savedArticles');
    return res.status(200).json(user);
  }

  await Story.findByIdAndUpdate(articleId, {
    $inc: { favoriteCount: 1 },
  });

  res.status(200).json(updatedUser);
};
export const removeArticleFromSaved = async (req, res) => {
  const { articleId } = req.body;
  const userId = req.user._id;

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: userId,
      savedArticles: articleId,
    },
    {
      $pull: { savedArticles: articleId },
    },
    { new: true },
  ).populate('savedArticles');

  if (!updatedUser) {
    const user = await User.findById(userId).populate('savedArticles');
    return res.status(200).json(user);
  }

  await Story.findByIdAndUpdate(articleId, {
    $inc: { favoriteCount: -1 },
  });

  res.status(200).json(updatedUser);
};

export const getPopularStories = async (req, res) => {
  const { page = 1, perPage = 4, category } = req.query;

  const parsedPage = Number(page);
  const parsedPerPage = Number(perPage);

  if (Number.isNaN(parsedPage) || parsedPage < 1) {
    throw createHttpError(400, 'Invalid page');
  }
  if (Number.isNaN(parsedPerPage) || parsedPerPage < 1) {
    throw createHttpError(400, 'Invalid perPage');
  }

  const safePerPage = Math.min(parsedPerPage, 20);
  const skip = (parsedPage - 1) * safePerPage;

  const filter = {};

  if (category) {
    const foundCategory = await Category.findOne({ name: category });
    if (!foundCategory) {
      throw createHttpError(404, 'No such category');
    }
    filter.category = foundCategory._id;
  }

  const popularQuery = Story.find(filter)
    .sort({ favoriteCount: -1, createdAt: -1 })
    .populate(['category', 'ownerId']);

  const [totalItems, stories] = await Promise.all([
    popularQuery.clone().countDocuments(),
    popularQuery.skip(skip).limit(safePerPage),
  ]);

  const totalPages = Math.ceil(totalItems / safePerPage);

  res.status(200).json({
    page: parsedPage,
    perPage: safePerPage,
    totalItems,
    totalPages,
    stories,
  });
};

export const getStoryByIdController = async (req, res) => {
  try {
    const { _id } = req.params;
    
     if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid story id",
      });
    }

    const story = await getStoryByIdService(_id);

    if (!story) {
      return res.status(404).json({
        status: 404,
        message: 'Story not found',
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Successfully found story!',
      data: story,
    });
  } catch (error) {
    console.error('Get story by ID error:', error);

    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
    });
  }
};
