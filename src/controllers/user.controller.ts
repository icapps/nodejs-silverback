import * as httpStatus from 'http-status';
import { Router, Request, Response } from 'express';
import { handleAsyncFn } from 'tree-house';
import { responder } from '../lib/responder';
import * as userService from '../services/user.service';

export const routes: Router = Router({ mergeParams: true })
  .get('/', handleAsyncFn(getAll));


/**
 * Get all users
 */
async function getAll(_req: Request, res: Response) {
  const users = await userService.getAll();
  return responder.succes(res, {
    status: httpStatus.OK,
    payload: users,
  });
}
