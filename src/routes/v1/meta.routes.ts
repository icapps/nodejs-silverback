import { Router } from 'express';
import { handleAsyncFn } from 'tree-house';
import { hasPermission } from '../../middleware/permission.middleware';
import { roles } from '../../config/roles.config';
import { validateSchema } from '../../lib/validator';
import { metaSchema } from '../../schemes/meta.schema';
import * as controller from '../../controllers/meta.controller';

export const routes: Router = Router({ mergeParams: true })
  .get('/code-types', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN), validateSchema(metaSchema.findCodeTypes), handleAsyncFn(controller.findAllCodeTypes))
  .get('/codes', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN), validateSchema(metaSchema.findByCodeId), handleAsyncFn(controller.findAllCodes));
