import * as Joi from 'joi';

export const userSchema = Joi.object({
  id: Joi.string().guid().required(),
  email: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  hasAccess: Joi.boolean().required(),
  role: Joi.string().required(), // TODO: Type of roles (code)
});

export const usersSchema = Joi.object().keys({
  meta: Joi.object().keys({
    type: Joi.string().required().only('users'),
    count: Joi.number().required(),
    totalCount: Joi.number().required(),
  }),
  data: Joi.array().items(userSchema),
});
