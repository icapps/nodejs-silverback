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
