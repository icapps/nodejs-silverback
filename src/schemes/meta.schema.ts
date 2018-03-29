import * as Joi from 'joi';

export const metaSchema = {
  findAllCodeTypes: {
    query: {
      offset: Joi.number(),
      limit: Joi.number(),
      sortOrder: Joi.string().valid('asc', 'desc'),
      sortField: Joi.string(),
      search: Joi.string(),
    },
  },
  findByCodeId: {
    query: {
      codeId: Joi.string().guid(),
      offset: Joi.number(),
      limit: Joi.number(),
      sortOrder: Joi.string().valid('asc', 'desc'),
      sortField: Joi.string(),
      search: Joi.string(),
    },
  },
};
