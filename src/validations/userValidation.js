import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';

export const getAllUserSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
  }),
};

export const updateUserSchema = Joi.object({
  name: Joi.string().max(32).optional(),
  avatarUrl: Joi.string().optional(),
  description: Joi.string().max(150).optional(),
}).min(1);

// Кастомний валідатор для ObjectI
const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

// Схема для перевірки параметра userId
export const userIdParamSchema = {
  [Segments.PARAMS]: Joi.object({
    userId: Joi.string().custom(objectIdValidator).required(),
  }),
};
