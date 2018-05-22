import * as Joi from 'joi';
import { roles } from '../config/roles.config';

const availableRoles = Object.keys(roles).reduce((array, current) => [...array, roles[current].code], []); // Collection to array

export const userSchema = {
  findAllUsers: {
    query: {
      offset: Joi.number(),
      limit: Joi.number(),
      sortOrder: Joi.string().valid('asc', 'desc'),
      sortField: Joi.string(),
      search: Joi.string(),
    },
  },
  findById: {
    params: {
      userId: Joi.string().guid(),
    },
  },
  create: {
    query: {
      changePassword: Joi.boolean(), // Change password after creation
    },
    body: Joi.object({
      email: Joi.string().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      hasAccess: Joi.boolean().required(),
      role: Joi.string().required().allow(availableRoles),
      password: Joi.string().min(6),
    }),
  },
  update: {
    params: {
      userId: Joi.string().guid(),
    },
    body: Joi.object({
      email: Joi.string().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      hasAccess: Joi.boolean().required(),
      role: Joi.string().required().allow(availableRoles),
    }),
  },
  updatePassword: {
    params: {
      userId: Joi.string().guid(),
    },
    body: Joi.object({
      password: Joi.string().min(6).required(),
    }),
  },
  partialUpdate: {
    params: {
      userId: Joi.string().guid(),
    },
    body: Joi.object({
      email: Joi.string().email(),
      firstName: Joi.string(),
      lastName: Joi.string(),
      hasAccess: Joi.boolean(),
      role: Joi.string().allow(availableRoles),
    }),
  },
  remove: {
    params: {
      userId: Joi.string().guid(),
    },
  },
};
