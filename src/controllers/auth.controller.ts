import * as httpStatus from 'http-status';
import { Router, Request, Response } from 'express';
import { handleAsyncFn } from 'tree-house';
import { responder } from '../lib/responder';
import { authSerializer } from '../serializers/auth.serializer';
import { validateSchema } from '../lib/validator';
import { authSchema } from '../schemes/auth.schema';
import * as authService from '../services/auth.service';

export const routes: Router = Router({ mergeParams: true })
  .post('/login', validateSchema(authSchema.login), handleAsyncFn(login));


/**
 * Return all users
 */
async function login(req: Request, res: Response) {
  const data = await authService.login(req.body);
  return responder.succes(res, {
    status: httpStatus.OK,
    payload: data,
    serializer: authSerializer,
  });
}
