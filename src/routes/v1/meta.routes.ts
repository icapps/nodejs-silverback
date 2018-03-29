import { Router } from 'express';
import { handleAsyncFn, validateSchema } from 'tree-house';
import { hasPermission } from '../../middleware/permission.middleware';
import { roles } from '../../config/roles.config';
import { metaSchema } from '../../schemes/meta.schema';
import * as controller from '../../controllers/meta.controller';

const defaultOptions = { allowUnknownQuery: false };
export const routes: Router = Router({ mergeParams: true })
  .get('/code-types', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN),
    validateSchema(metaSchema.findAllCodeTypes, defaultOptions),
    handleAsyncFn(controller.findAllCodeTypes))
  .get('/codes', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN),
    validateSchema(metaSchema.findByCodeId, defaultOptions),
    handleAsyncFn(controller.findAllCodes));
