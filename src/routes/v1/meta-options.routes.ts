import { Router } from 'express';
import { handleAsyncFn } from 'tree-house';
import { hasPermission } from '../../middleware/permission.middleware';
import { roles } from '../../config/roles.config';
import { validateSchema } from '../../lib/validator';
import { metaOptionsSchema } from '../../schemes/meta-options.schema';
import * as controller from '../../controllers/meta-options.controller';

export const routes: Router = Router({ mergeParams: true })
  .get('/codeTypes', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN), handleAsyncFn(controller.findAllCodeTypes))
  .get('/codes', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN), validateSchema(metaOptionsSchema.findByCodeId), handleAsyncFn(controller.findAllCodes));
