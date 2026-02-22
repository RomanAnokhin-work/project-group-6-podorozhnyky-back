import { User } from '../models/user.js';
import { Traveller } from '../models/traveller.js';
import { saveFileToCloudinary } from '../services/cloudinaryService.js';
import { updateUserCurrentService } from '../services/userService.js';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';

export const getAllUsers = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;
  const usersQuery = User.find();

  const [totalUser, users] = await Promise.all([
    usersQuery.clone().countDocuments(),
    usersQuery.skip(skip).limit(perPage),
  ]);
  const totalPages = Math.ceil(totalUser / perPage);

  res.status(200).json({ page, perPage, totalUser, totalPages, users });
};

export const getCurrentUser = (req, res) => {
  res.json(req.user);
};

export const updateCurrentUserController = async (req, res) => {
  const userId = req.user._id;
  const { name, description } = req.body;
  const avatar = req.file;
  let avatarUrl;

  if (avatar) {
    avatarUrl = await saveFileToCloudinary(avatar);
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (avatarUrl) updateData.avatarUrl = avatarUrl;

  const updatedUser = await updateUserCurrentService(userId, updateData);

  res.status(200).json({
    status: 200,
    message: 'User profile updated successfully',
    data: updatedUser,
  });
};

export const getUserById = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createHttpError(400, 'Invalid user ID');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const articles = await Traveller.find({ ownerId: userId })
    .sort({
      createdAt: -1,
    })
    .populate('ownerId', 'name avatarUrl');
  res.status(200).json({ user, articles });
};

export const addArticleToSaved = async (req, res) => {
  const { articleId } = req.body;
  const userId = req.user._id;

  const articleExists = await Traveller.exists({ _id: articleId });

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

  await Traveller.findByIdAndUpdate(articleId, {
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

  await Traveller.findByIdAndUpdate(articleId, {
    $inc: { favoriteCount: -1 },
  });

  res.status(200).json(updatedUser);
};
