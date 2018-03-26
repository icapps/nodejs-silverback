import * as expressValidation from 'express-validation';

// TODO: Move to tree-house module!
export function validateSchema(schema) {
  return function (req, res, next) {
    expressValidation(schema)(req, res, next);
  };
}
