import { AuthCredentials } from '../models/auth.model';
import { AuthenticationError, UnauthorizedError } from 'tree-house-errors';
import { comparePassword, createJwt, generateRandomHash } from 'tree-house-authentication';
import { jwtConfig } from '../config/auth.config';
import { logger } from '../lib/logger';
import { errors } from '../config/errors.config';
import * as userRepository from '../repositories/user.repository';

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
