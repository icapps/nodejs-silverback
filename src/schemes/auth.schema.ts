import * as Joi from 'joi';

export const authSchema = {
  login: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required(),
      deviceId: Joi.string(),
    },
  },
  forgotPwInit: {
    body: {
      email: Joi.string().email().required(),
    },
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
    body: {
      password: Joi.string().required(),
    },
  },
};
