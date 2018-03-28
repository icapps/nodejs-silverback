import { AuthCredentials } from '../models/auth.model';
import { AuthenticationError, UnauthorizedError, NotFoundError } from 'tree-house-errors';
import { comparePassword, createJwt, generateRandomHash } from 'tree-house-authentication';
import { jwtConfig } from '../config/auth.config';
import { logger } from '../lib/logger';
import { errors } from '../config/errors.config';
import { getForgotPwContent } from '../templates/forgot-pw.mail.template';
import * as userRepository from '../repositories/user.repository';
import * as mailer from '../lib/mailer';

/**
 * Login user with username and password
 * Returns accessToken and refreshToken
 */
export async function login(payload: AuthCredentials) {
  const { username, password } = payload;
  try {
    const user = await userRepository.findByEmail(username);
    if (!user) throw new AuthenticationError();

    // Check if still has access
    if (!user.hasAccess) throw new UnauthorizedError(errors.USER_INACTIVE);

    // Match password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) throw new AuthenticationError();

    // Generate JWT and refresh token
    const accessToken = await createJwt({ userId: user.id }, jwtConfig);
    const refreshToken = generateRandomHash('sha256', jwtConfig.secretOrKey);

    // TODO: Store refreshToken

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error(`An error occured trying to login: %${error}`);
    throw error;
  }
}


/**
 * Start the forgot password flow by generating an email with a reset link
 */
export async function initForgotPw(email: string) {
  try {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new NotFoundError();

    const token = generateRandomHash('sha256', jwtConfig.secretOrKey);
    // Update user with reset id

    // Send email with reset link
    const content = getForgotPwContent(email, token);
    await mailer.sendTemplate(content, mailer.getDefaultClient());

  } catch (error) {
    logger.error(`An error occured trying to reset password: %${error}`);
    // Do not rethrow error, this will be an async function
  }
}
