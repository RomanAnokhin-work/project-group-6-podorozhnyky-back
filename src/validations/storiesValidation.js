import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';

export const getStoriesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    category: Joi.string().min(3),
  }),
};

export const getOwnStoriesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
  }),
};

const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

export const createStorySchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().max(80).required(),
    article: Joi.string().max(2500).required(),
    category: Joi.string().custom(objectIdValidator).required(),
  }),
};

export const updateStorySchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().max(80),
    article: Joi.string().max(2500),
    category: Joi.string().custom(objectIdValidator),
  }).min(1),
  [Segments.PARAMS]: Joi.object({
    storyId: Joi.string().custom(objectIdValidator).required(),
  }),
};

export const paginationQuerySchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(50).default(9),
  }),
};
