import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import { responder } from '../lib/responder';
import { authSerializer } from '../serializers/auth.serializer';
import { AuthRequest } from '../models/request.model';
import { Role } from '../config/roles.config';
import * as authService from '../services/auth.service';

/**
 * Login a user using session authentication
 */
export async function login(req, res: Response, role?: Role): Promise<void> {
  const data = await authService.login(req.body, 'session', role);

  // Set current session data
  req.session.userId = data;

  // Reset brute force protection and return response
  req.brute.reset(() => {
    responder.success(res, {
      status: httpStatus.OK,
    });
  });
}

/**
 * Login a user using jwt authentication
 */
export async function loginJwt(req: Request, res: Response, role?: Role): Promise<void> {
  const data = await authService.login(req.body, 'jwt', role);

  // Reset brute force protection and return response
  req.brute.reset(() => {
    responder.success(res, {
      status: httpStatus.OK,
      payload: data,
      serializer: authSerializer,
    });
  });
}

/**
 * Logout a logged in user
 */
export async function logout(req: AuthRequest, res: Response): Promise<void> {
  await authService.logout(req);
  responder.success(res, {
    status: httpStatus.OK,
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
