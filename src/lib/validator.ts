import * as expressValidation from 'express-validation';

// TODO: Move to tree-house module!
export function validateSchema(schema) {
  return function (req, res, next) {
    // assign options
    expressValidation.options({
      allowUnknownBody: false,
      allowUnknownParams: false,
      allowUnknownQuery: false,
    });

    expressValidation(schema)(req, res, next);
  };
}
