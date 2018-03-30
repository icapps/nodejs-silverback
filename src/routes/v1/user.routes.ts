import { Router } from 'express';
import { handleAsyncFn, validateSchema } from 'tree-house';
import { hasPermission } from '../../middleware/permission.middleware';
import { roles } from '../../config/roles.config';
import { userSchema } from '../../schemes/user.schema';
import * as controller from '../../controllers/user.controller';

export const routes: Router = Router({ mergeParams: true })
  .get('/', (req, res, next) => // TODO: Joi validator for query parameters
    hasPermission(req, res, next, roles.ADMIN), handleAsyncFn(controller.findAll))
  .get('/:userId', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN), validateSchema(userSchema.findById), handleAsyncFn(controller.findById))
  .post('/', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN), validateSchema(userSchema.create), handleAsyncFn(controller.create))
  .put('/:userId', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN), validateSchema(userSchema.update), handleAsyncFn(controller.update))
  .patch('/:userId', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN), validateSchema(userSchema.partialUpdate), handleAsyncFn(controller.partialUpdate))
  .delete('/:userId', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN), validateSchema(userSchema.remove), handleAsyncFn(controller.remove));

