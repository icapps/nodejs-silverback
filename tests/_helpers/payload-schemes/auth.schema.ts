import * as Joi from 'joi';

export const loginSchema = Joi.object().keys({
  meta: Joi.object().keys({
    type: Joi.string().required().only('authentication'),
  }),
  data: Joi.object({
    accessToken: Joi.string().required(),
    refreshToken: Joi.string().required(),
  }),
});
