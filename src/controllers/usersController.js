import { User } from '../models/user.js';
import { Traveller } from '../models/traveller.js';
import { saveFileToCloudinary } from '../services/cloudinaryService.js';
import { updateUserCurrentService } from '../services/userService.js';
import {
  generateVerificationToken,
  sendVerificationEmail,
  verifyEmailToken,
} from '../verification/userVerification.js';
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
  const { email } = req.body;

  if (avatar) {
    avatarUrl = await saveFileToCloudinary(avatar);
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (avatarUrl) updateData.avatarUrl = avatarUrl;

  // Handle email change: create pendingEmail + send verification link
  if (email && email !== req.user.email) {
    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      throw createHttpError(409, 'Email already in use');
    }

    const token = generateVerificationToken();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save pending fields directly on user
    const user = await User.findById(userId).select(
      '+verificationToken verificationTokenExpires',
    );
    user.pendingEmail = email;
    user.verificationToken = token;
    user.verificationTokenExpires = expires;
    user.isVerified = false;
    await user.save();

    // Send verification email to the new address
    await sendVerificationEmail(email, token);
  }

  await updateUserCurrentService(userId, updateData);

  const finalUser = await User.findById(userId);

  res.status(200).json({
    status: 200,
    message: 'User profile updated successfully',
    data: finalUser,
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

export const verifyEmailController = async (req, res) => {
  const { token } = req.query;
  if (!token) throw createHttpError(400, 'Token is required');

  const user = await verifyEmailToken(token);
  if (!user) throw createHttpError(400, 'Invalid or expired token');

  res.status(200).json({ message: 'Email verified successfully', user });
};
