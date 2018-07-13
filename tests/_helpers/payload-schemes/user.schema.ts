import * as Joi from 'joi';
import { roles } from '../../../src/config/roles.config';

const roleNames = Object.keys(roles).reduce((acc, current: any) => [...acc, roles[current].code], []);

export const userRoleSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required().allow(roleNames),
  description: Joi.string(),
  level: Joi.number().required(),
});

export const userSchema = Joi.object({
  id: Joi.string().guid().required(),
  email: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  hasAccess: Joi.boolean().required(),
  role: userRoleSchema,
  createdAt: Joi.date().iso().raw().required(),
  updatedAt: Joi.date().iso().raw().required(),
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
