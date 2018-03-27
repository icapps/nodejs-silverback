import * as Joi from 'joi';

export const userSchema = {
  create: {
    body: {
      email: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      password: Joi.string().required(),
      hasAccess: Joi.boolean().required(),
      role: Joi.string().required(),
    },
  },
  update: {
    params: {
      userId: Joi.string().guid(),
    },
    body: {
      email: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      hasAccess: Joi.boolean().required(),
      role: Joi.string().required(),
    },
  },
  partialUpdate: {
    params: {
      userId: Joi.string().guid(),
    },
    body: {
      email: Joi.string(),
      firstName: Joi.string(),
      lastName: Joi.string(),
      hasAccess: Joi.boolean(),
      role: Joi.string(),
    },
  },
  remove: {
    params: {
      userId: Joi.string().guid(),
    },
  },
};
