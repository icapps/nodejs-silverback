import * as crypto from 'crypto';
import { AuthCredentials } from '../models/auth.model';
import { AuthenticationError, UnauthorizedError, NotFoundError } from 'tree-house-errors';
import { comparePassword, createJwt, generateRandomHash } from 'tree-house-authentication';
import { jwtConfig } from '../config/auth.config';
import { logger } from '../lib/logger';
import { errors } from '../config/errors.config';
import { getForgotPwContent } from '../templates/forgot-pw.mail.template';
import { User } from '../models/user.model';
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

    // const token = generateRandomHash('sha256', tokenConfig.secretOrKey);
    const token = crypto.randomBytes(24).toString('hex'); // TODO: Integrate this in tree-house-authentication to replace generateRandomHash
    await userRepository.update(user.id, { resetPwToken: token });

    // Send email with reset link
    const content = getForgotPwContent(email, token);
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
    if (!user || !user.resetPwToken) throw new NotFoundError();
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
