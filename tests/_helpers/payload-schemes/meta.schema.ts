import * as Joi from 'joi';

export const codeTypeSchema = Joi.object({
  id: Joi.string().guid().required(),
  code: Joi.string().required(),
  description: Joi.string(),
});

export const codeTypesSchema = Joi.object().keys({
  meta: Joi.object().keys({
    type: Joi.string().required().only('codeTypes'),
    count: Joi.number().required(),
    totalCount: Joi.number().required(),
  }),
  data: Joi.array().items(codeTypeSchema),
});

export const codeSchema = Joi.object({
  id: Joi.string().guid().required(),
  value: Joi.string().required(),
});

export const codesSchema = Joi.object().keys({
  meta: Joi.object().keys({
    type: Joi.string().required().only('codes'),
    count: Joi.number().required(),
    totalCount: Joi.number().required(),
  }),
  data: Joi.array().items(codeSchema),
});
