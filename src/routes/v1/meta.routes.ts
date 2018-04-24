import { Router } from 'express';
import { handleAsyncFn, validateSchema } from 'tree-house';
import { hasPermission } from '../../middleware/permission.middleware';
import { roles } from '../../config/roles.config';
import { metaSchema } from '../../schemes/meta.schema';
import * as controller from '../../controllers/meta.controller';

const defaultOptions = { allowUnknownQuery: false };
export const routes: Router = Router({ mergeParams: true })
  .get('/codes/:codeType', (req, res, next) =>
    hasPermission(req, res, next, roles.USER),
    validateSchema(metaSchema.findAllCodes, defaultOptions),
    handleAsyncFn(controller.findAllCodes))
  .get('/codes/:codeType/all', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN),
    validateSchema(metaSchema.findAllCodes, defaultOptions),
    handleAsyncFn(controller.findAllCodes))

  .post('/codes/:codeType', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN),
    validateSchema(metaSchema.createCode, defaultOptions),
    handleAsyncFn(controller.createCode))

  .post('/codes/:codeId/deprecate', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN),
    validateSchema(metaSchema.deprecateCode, defaultOptions),
    handleAsyncFn(controller.deprecateCode));
