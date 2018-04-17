import * as Joi from 'joi';

export const roleSchema = Joi.object({
  code: Joi.string().required(),
  name: Joi.string().required(),
  level: Joi.number().required(),
  description:Joi.string().allow(null).allow(''),
});

export const rolesSchema = Joi.object().keys({
  meta: Joi.object().keys({
    type: Joi.string().required().only('roles'),
    count: Joi.number().required(),
    totalCount: Joi.number().required(),
  }),
  data: Joi.array().items(roleSchema),
});
