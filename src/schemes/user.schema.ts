import * as Joi from 'joi';

export const userSchema = {
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
      role: Joi.string().required(),
      password: Joi.string().required(),
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
      role: Joi.string().required(),
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
      role: Joi.string(),
    }),
  },
  remove: {
    params: {
      userId: Joi.string().guid(),
    },
  },
};
