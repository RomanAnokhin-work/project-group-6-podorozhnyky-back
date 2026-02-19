import { Joi, Segments } from 'celebrate';


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
