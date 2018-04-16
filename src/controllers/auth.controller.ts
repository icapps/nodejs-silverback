import * as httpStatus from 'http-status';
import { decodeJwt } from 'tree-house-authentication';
import { Request, Response } from 'express';
import { responder } from '../lib/responder';
import { authSerializer } from '../serializers/auth.serializer';
import { extractJwt } from '../lib/utils';
import { JwtPayload } from '../middleware/permission.middleware';
import * as authService from '../services/auth.service';

/**
 * Return all users
 */
export async function login(req: Request, res: Response): Promise<void> {
  const data = await authService.login(req.body);
  responder.success(res, {
    status: httpStatus.OK,
    payload: data,
    serializer: authSerializer,
  });
}


/**
 * Return a new access token via their refresh token
 */
export async function refresh(req: Request, res: Response): Promise<void> {
  const accessToken = extractJwt(req);
  console.log(accessToken);
  const { userId } = <JwtPayload>await decodeJwt(accessToken);
  const { refreshToken } = req.body;

  const data = await authService.refresh(userId, refreshToken);
  responder.success(res, {
    status: httpStatus.OK,
    payload: data,
    serializer: authSerializer,
  });
}


/**
 * Start the forgot password flow by generating an email with a reset link
 * Always send status OK for security reasons (run the function async)
 */
export async function initForgotPw(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  authService.initForgotPw(email); // Run async without waiting
  responder.success(res, {
    status: httpStatus.OK,
  });
}


/**
 * Verify if a forgot password reset token is still valid
 */
export async function verifyForgotPw(req: Request, res: Response): Promise<void> {
  const { token } = req.query;
  await authService.verifyForgotPw(token);
  responder.success(res, {
    status: httpStatus.OK,
  });
}

/**
 * Confirm newly choosen password
 */
export async function confirmForgotPw(req: Request, res: Response): Promise<void> {
  const { password } = req.body;
  const { token } = req.query;

  await authService.confirmForgotPw(token, password);
  responder.success(res, {
    status: httpStatus.OK,
  });
}
