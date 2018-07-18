import * as Joi from 'joi';

export const metaSchema = {
  findAllCodes: {
    params: {
      codeType: Joi.string().required(),
    },
    query: {
      offset: Joi.number(),
      limit: Joi.number(),
      sortOrder: Joi.string().valid('asc', 'desc'),
      sortField: Joi.string(),
      search: Joi.string(),
    },
  },
  findById: {
    params: {
      codeId: Joi.string().guid(),
    },
  },
  createCode: {
    params: {
      codeType: Joi.string().required(),
    },
    body: {
      code: Joi.string().required(),
      name: Joi.string().required(),
      description: Joi.string(),
    },
  },
  updateCode: {
    params: {
      codeId: Joi.string().guid(),
    },
    body: Joi.object({
      name: Joi.string(),
      description: Joi.string(),
      deprecated: Joi.boolean(),
    }).min(1),
  },
  deprecateCode: {
    params: {
      codeId: Joi.string().guid().required(),
    },
  },
};
