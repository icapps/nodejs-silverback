import * as Joi from 'joi';

export const metaOptionsSchema = {
  findByCodeId: {
    params: {
      codeId: Joi.string().guid(),
    },
  },
};
