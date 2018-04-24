import * as Joi from 'joi';
import { roles } from '../../../src/config/roles.config';

const roleNames = Object.keys(roles).reduce((acc, current: any) => [...acc, roles[current].code], []);

export const userSchema = Joi.object({
  id: Joi.string().guid().required(),
  email: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  hasAccess: Joi.boolean().required(),
  role: Joi.string().required().valid(roleNames),
  createdAt: Joi.date().iso().raw(),
  updatedAt: Joi.date().iso().raw(),
});

export const createUserSchema = Joi.object().keys({
  meta: Joi.object().keys({
    type: Joi.string().required().only('users'),
  }),
  data: userSchema,
});

export const userByIdSchema = Joi.object().keys({
  meta: Joi.object().keys({
    type: Joi.string().required().only('users'),
  }),
  data: userSchema,
});

export const usersSchema = Joi.object().keys({
  meta: Joi.object().keys({
    type: Joi.string().required().only('users'),
    count: Joi.number().required(),
    totalCount: Joi.number().required(),
  }),
  data: Joi.array().items(userSchema),
});
