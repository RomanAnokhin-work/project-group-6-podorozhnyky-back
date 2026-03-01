import { Story } from '../models/story.js';



// export const getStoryByIdService = async (storyId) => {
//   const story = await Story.findById(storyId)
//     .populate({ path: 'ownerId', select: 'name' })
//     .populate({ path: 'category', select: 'name' })
//     .lean();

//   return story;
// };
export const getStoryByIdService = async (storyId) => {
  return await Story.findById(storyId)
    .populate('ownerId', 'name email')
    .populate('category', 'name');
};
