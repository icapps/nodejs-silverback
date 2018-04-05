import * as Joi from 'joi';

export const configSchema = {
  appVersion: {
    params: {
      os: Joi.string().required().valid('ios', 'android'),
    },
  },
};
