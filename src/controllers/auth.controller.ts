import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import { responder } from '../lib/responder';
import { authSerializer } from '../serializers/auth.serializer';
import * as authService from '../services/auth.service';

/**
 * Return all users
 */
export async function login(req: Request, res: Response): Promise<void> {
  const data = await authService.login(req.body);
  responder.succes(res, {
    status: httpStatus.OK,
    payload: data,
    serializer: authSerializer,
  });
}
