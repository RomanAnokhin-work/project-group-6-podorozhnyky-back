import { User } from '../models/user.js';
export const updateUserCurrentService = async (userId, updateData) => {
  const updated = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  });
  return updated;
};
