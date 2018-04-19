import * as httpStatus from 'http-status';
import { Response } from 'express';
import { responder } from '../lib/responder';
import { userSerializer } from '../serializers/user.serializer';
import { AuthRequest } from '../models/request.model';


/**
 * Return logged in user's information
 */
export async function findCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  const user = req.session.user;
  responder.success(res, {
    status: httpStatus.OK,
    payload: user,
    serializer: userSerializer,
  });
}

