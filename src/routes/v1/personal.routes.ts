import { Router } from 'express';
import { handleAsyncFn } from 'tree-house';
import { hasPermission } from '../../middleware/permission.middleware';
import * as controller from '../../controllers/personal.controller';

export const routes: Router = Router({ mergeParams: true })
  .get('/', (req, res, next) =>
    hasPermission(req, res, next),
    handleAsyncFn(controller.findCurrentUser));
