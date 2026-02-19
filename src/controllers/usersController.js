import { User } from "../models/user.js";


export const getAllUsers = async (req, res) => {

  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;
  const usersQuery = User.find();

  const [totalUser, users] = await Promise.all([
    usersQuery.clone().countDocuments(),
    usersQuery.skip(skip).limit(perPage)
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
