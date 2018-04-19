import * as httpStatus from 'http-status';
import { Response } from 'express';
import { responder } from '../lib/responder';
import { userSerializer } from '../serializers/user.serializer';
import { AuthRequest } from '../models/request.model';
import * as userService from '../services/user.service';

/**
 * Return logged in user's information
 */
export function findCurrentUser(req: AuthRequest, res: Response): void {
  const user = req.session.user;
  responder.success(res, {
    status: httpStatus.OK,
    payload: user,
    serializer: userSerializer,
  });
}


/**
 * Update current user's information
 */
export async function updateCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  const result = await userService.update(req.session.user.id, req.body);
  responder.success(res, {
    status: httpStatus.OK,
    payload: result,
    serializer: userSerializer,
  });
}
