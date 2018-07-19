import * as uuid from 'uuid';
import { AuthCredentials } from '../models/auth.model';
import { AuthenticationError, UnauthorizedError, NotFoundError } from 'tree-house-errors';
import { comparePassword, createJwt } from 'tree-house-authentication';
import { jwtConfig } from '../config/auth.config';
import { logger } from '../lib/logger';
import { errors } from '../config/errors.config';
import { getForgotPwContent } from '../templates/forgot-pw.mail.template';
import { User } from '../models/user.model';
import { Role } from '../config/roles.config';
import * as userRepository from '../repositories/user.repository';
import * as mailer from '../lib/mailer';
import { hasRole, checkStatus } from '../lib/utils';
import { AuthRequest } from '../models/request.model';

/**
 * Generate a new jwt token for a user
 */
export async function generateAccessToken(userId: string) {
  const accessToken = await createJwt({ userId }, jwtConfig);
  return { accessToken };
}

/**
 * Login user with email and password
 * Returns accessToken
 */
export async function login(payload: AuthCredentials, authentication: 'jwt' | 'session', role?: Role) {
  const { email, password } = payload;
  try {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AuthenticationError(errors.USER_INVALID_CREDENTIALS);

    // Match password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) throw new AuthenticationError(errors.USER_INVALID_CREDENTIALS);

    // Check if user has access
    checkStatus(user);

    // Must have a specific role to login here
    if (role && !hasRole(user, role)) throw new UnauthorizedError(errors.NO_PERMISSION);

    // Generate JWT token or return user id (depending of authentication method)
    return authentication === 'jwt' ? await generateAccessToken(user.id) : user.id;
  } catch (error) {
    logger.error(`An error occured trying to login: %${error}`);
    throw error;
  }
}

/**
 * Logout an existing user (session)
 */
export async function logout(req) {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) {
        logger.error(`An error occured trying to logout: %${error}`);
        return reject(error);
      }
      return resolve();
    });
  });
}

/**
 * Start the forgot password flow by generating an email with a reset link
 */
export async function initForgotPw(email: string) {
  try {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new NotFoundError();

    const token = uuid.v4();
    await userRepository.update(user.id, { resetPwToken: token });

    // Send email with reset link
    const content = getForgotPwContent({ email, token, firstName: user.firstName });
    return await mailer.sendTemplate(content, mailer.getDefaultClient());
  } catch (error) {
    logger.error(`An error occured trying to reset password: %${error}`);
    // Do not rethrow error, this will be an async function
  }
}

/**
 * Verify if a forgot password reset token is still valid
 */
export async function verifyForgotPw(token: string): Promise<void> {
  try {
    const user = await userRepository.findByResetToken(token);
    if (!user || !user.resetPwToken) throw new NotFoundError(errors.LINK_EXPIRED);
  } catch (error) {
    logger.error(`An error occured trying to verify reset password token: %${error}`);
    throw error;
  }
}

/**
 * Confirm a newly choosen password
 */
export async function confirmForgotPw(token: string, password: string): Promise<User> {
  try {
    const user = await userRepository.findByResetToken(token);
    if (!user || !user.resetPwToken) throw new NotFoundError();
    return userRepository.updatePassword(user.id, password);
  } catch (error) {
    logger.error(`An error occured trying to change password: %${error}`);
    throw error;
  }
}
