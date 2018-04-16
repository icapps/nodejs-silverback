import * as crypto from 'crypto';
import { AuthCredentials } from '../models/auth.model';
import { AuthenticationError, UnauthorizedError, NotFoundError } from 'tree-house-errors';
import { comparePassword, createJwt } from 'tree-house-authentication';
import { jwtConfig } from '../config/auth.config';
import { logger } from '../lib/logger';
import { errors } from '../config/errors.config';
import { getForgotPwContent } from '../templates/forgot-pw.mail.template';
import { User } from '../models/user.model';
import * as userRepository from '../repositories/user.repository';
import * as mailer from '../lib/mailer';


/**
 * Generate a new jwt token and refresh token for a user
 */
export async function generateTokens(userId: string) {
  const accessToken = await createJwt({ userId }, jwtConfig);
  const refreshToken = crypto.randomBytes(24).toString('hex'); // TODO: Use tree-house-authentication
  await userRepository.update(userId, { refreshToken }); // TODO: Write test if refresh token has been stored

  return { accessToken, refreshToken };
}


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
    return await generateTokens(user.id);
  } catch (error) {
    logger.error(`An error occured trying to login: %${error}`);
    throw error;
  }
}


/**
 * Refresh access token via a refresh token
 */
export async function refresh(userId: string, refreshToken: string) {
  try {
    const user = await userRepository.findByRefreshToken(userId, refreshToken);
    if (!user) throw new NotFoundError();

    // Generate JWT and refresh token
    return await generateTokens(user.id);
  } catch (error) {
    logger.error(`An error occured trying to refresh token: %${error}`);
    throw error;
  }
}


/**
 * Logout an existing user by removing its refresh token
 */
export async function logout(userId: string) {
  try {
    return await userRepository.update(userId, { refreshToken: null });
  } catch (error) {
    logger.error(`An error occured trying to logout: %${error}`);
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
