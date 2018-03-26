import * as Joi from 'joi';

export const metaOptionSchema = Joi.object({
  id: Joi.string().guid().required(),
  code: Joi.string().required(),
  value: Joi.string().required(),
});

export const metaOptionsSchema = Joi.object().keys({
  meta: Joi.object().keys({
    type: Joi.string().required().only('metaOptions'),
    count: Joi.number().required(),
    totalCount: Joi.number().required(),
  }),
  data: Joi.array().items(metaOptionSchema),
});
