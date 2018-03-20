import * as httpStatus from 'http-status';
import { Router, Request, Response } from 'express';
import { handleAsyncFn } from 'tree-house';
import { responder } from '../lib/responder';
import { userSerializer } from '../serializers/user.serializer';
import { hasPermission } from '../middleware/permission.middleware';
import { roles } from '../config/roles.config';
import * as userService from '../services/user.service';

export const routes: Router = Router({ mergeParams: true })
  .get('/', (req, res, next) => hasPermission(req, res, next, roles.ADMIN), handleAsyncFn(getAll));


/**
 * Return all users
 */
async function getAll(req: Request, res: Response) {
  const { data, totalCount } = await userService.getAll(req.query);
  return responder.succes(res, {
    totalCount,
    status: httpStatus.OK,
    payload: data,
    serializer: userSerializer,
  });
}
