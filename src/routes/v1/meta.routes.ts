import { Router } from 'express';
import { handleAsyncFn, validateSchema } from 'tree-house';
import { hasPermission } from '../../middleware/permission.middleware';
import { roles } from '../../config/roles.config';
import { metaSchema } from '../../schemes/meta.schema';
import { AuthRequest } from '../../models/request.model';
import * as controller from '../../controllers/meta.controller';

const defaultOptions = { allowUnknownQuery: false };
export const routes: Router = Router({ mergeParams: true })
  .get('/codesByType/:codeType', (req, res, next) =>
    hasPermission(req, res, next, roles.USER),
    validateSchema(metaSchema.findAllCodes, defaultOptions),
    handleAsyncFn((req: AuthRequest, res) => controller.findAllCodes(req, res)))

  .get('/codesByType/:codeType/all', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN),
    validateSchema(metaSchema.findAllCodes, defaultOptions),
    handleAsyncFn((req: AuthRequest, res) => controller.findAllCodes(req, res, true)))

  .get('/codes/:codeId', (req, res, next) =>
    hasPermission(req, res, next, roles.USER),
    validateSchema(metaSchema.findById),
    handleAsyncFn(controller.findById))

  .post('/codes/:codeType', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN),
    validateSchema(metaSchema.createCode, defaultOptions),
    handleAsyncFn(controller.createCode))

  .post('/codes/:codeId/deprecate', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN),
    validateSchema(metaSchema.deprecateCode, defaultOptions),
    handleAsyncFn((req: AuthRequest, res) => controller.deprecateCode(req, res, true)))

  .post('/codes/:codeId/undeprecate', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN),
    validateSchema(metaSchema.deprecateCode, defaultOptions),
    handleAsyncFn((req: AuthRequest, res) => controller.deprecateCode(req, res, false)));
