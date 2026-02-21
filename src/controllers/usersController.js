import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Traveller } from '../models/traveller.js';

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

export const addArticleToSaved = async (req, res) => {
  const { articleId } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const alreadySaved = user.savedArticles.includes(articleId);

  if (alreadySaved) {
    return res.status(200).json(user);
  }

  const article = await Traveller.findById(articleId);

  if (!article) {
    throw createHttpError(404, 'Article not found!');
  }

  await Traveller.findByIdAndUpdate(articleId, {
    $inc: { favoriteCount: 1 },
  });

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { savedArticles: articleId } },
    { new: true },
  );

  res.status(200).json(updatedUser);
};

export const removeArticleFromSaved = async (req, res) => {
  const { userId } = req.cookies;

  const user = await User.findOneAndUpdate({ _id: userId }, req.body, {
    new: true,
  });

  if (!user) {
    throw createHttpError(404, 'Student not found');
  }

  res.status(200).json(user);
};
