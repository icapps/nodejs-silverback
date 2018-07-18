import { Router } from 'express';
import { handleAsyncFn, validateSchema } from 'tree-house';
import { hasPermission } from '../../middleware/permission.middleware';
import { userSchema } from '../../schemes/user.schema';
import * as controller from '../../controllers/personal.controller';

export const routes: Router = Router({ mergeParams: true })
  .get('/', (req, res, next) =>
    hasPermission(req, res, next),
    handleAsyncFn(controller.findCurrentUser))

  .put('/', (req, res, next) =>
    hasPermission(req, res, next),
    validateSchema(userSchema.update),
    handleAsyncFn(controller.updateCurrentUser));
