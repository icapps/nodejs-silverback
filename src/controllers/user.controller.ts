import * as httpStatus from 'http-status';
import { Router, Request, Response } from 'express';
import { handleAsyncFn } from 'tree-house';
import { responder } from '../lib/responder';
import { userSerializer } from '../serializers/user.serializer';
import { hasPermission } from '../middleware/permission.middleware';
import { roles } from '../config/roles.config';
import { validateSchema } from '../lib/validator';
import { userSchema } from '../schemes/user.schema';
import * as userService from '../services/user.service';

export const routes: Router = Router({ mergeParams: true })
  .get('/', (req, res, next) => // TODO: Joi validator for query parameters
    hasPermission(req, res, next, roles.ADMIN), handleAsyncFn(getAll))
  .post('/', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN), validateSchema(userSchema.create), handleAsyncFn(create))
  .put('/:userId', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN), validateSchema(userSchema.update), handleAsyncFn(update))
  .patch('/:userId', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN), validateSchema(userSchema.partialUpdate), handleAsyncFn(partialUpdate))
  .delete('/:userId', (req, res, next) =>
    hasPermission(req, res, next, roles.ADMIN), validateSchema(userSchema.remove), handleAsyncFn(remove));

/**
 * Return all users
 */
async function getAll(req: Request, res: Response): Promise<void> {
  const { data, totalCount } = await userService.getAll(req.query);
  responder.succes(res, {
    totalCount,
    status: httpStatus.OK,
    payload: data,
    serializer: userSerializer,
  });
}


/**
 * Create a new user
 */
async function create(req: Request, res: Response): Promise<void> {
  const result = await userService.create(req.body);
  responder.succes(res, {
    status: httpStatus.CREATED,
    payload: result,
    serializer: userSerializer,
  });
}


/**
 * Update an existing user
 */
async function update(req: Request, res: Response): Promise<void> {
  const result = await userService.update(req.params.userId, req.body);
  responder.succes(res, {
    status: httpStatus.OK,
    payload: result,
    serializer: userSerializer,
  });
}


/**
 * Update a property of an existing user
 */
async function partialUpdate(req: Request, res: Response): Promise<void> {
  const result = await userService.partialUpdate(req.params.userId, req.body);
  responder.succes(res, {
    status: httpStatus.OK,
    payload: result,
    serializer: userSerializer,
  });
}


/**
 * Remove an existing user
 */
async function remove(req: Request, res: Response): Promise<void> {
  await userService.remove(req.params.userId);
  responder.succes(res, {
    status: httpStatus.NO_CONTENT,
  });
}
