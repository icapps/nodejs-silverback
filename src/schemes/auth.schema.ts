import * as Joi from 'joi';

export const authSchema = {
  login: {
    body: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      deviceId: Joi.string(),
    }),
  },
  forgotPwInit: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },
  forgotPwVerify: {
    query: {
      token: Joi.string().required(),
    },
  },
  forgotPwConfirm: {
    query: {
      token: Joi.string().required(),
    },
    body: Joi.object({
      password: Joi.string().required(),
    }),
  },
};
