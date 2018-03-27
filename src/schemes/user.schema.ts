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
};
