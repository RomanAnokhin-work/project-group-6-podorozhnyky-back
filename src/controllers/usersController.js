export const getCurrentUser = (req, res) => {
  res.json(req.user);
};
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

