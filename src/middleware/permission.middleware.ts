import { Request, Response, NextFunction } from 'express';
import { authenticateJwt } from 'tree-house-authentication';
import { UnauthorizedError, NotFoundError } from 'tree-house-errors';
import { hasRole, extractJwt, checkStatus } from '../lib/utils';
import { logger } from '../lib/logger';
import { jwtConfig } from '../config/auth.config';
import { Role } from '../config/roles.config';
import { errors } from '../config/errors.config';
import * as userRepository from '../repositories/user.repository';

/**
 * Extract user id via session or jwt headers
 */
async function verifyHeaders(req) {
  let error;
  let userId;

  // Check if session authentication
  if (!req.session || !req.session.userId) {
    error = new UnauthorizedError(errors.MISSING_HEADERS);
  } else {
    userId = req.session.userId;
  }

  // Otherwise check for jwt authentication
  if (req.headers['authorization'] && !userId) {
    try {
      const accessToken = extractJwt(req);
      const decodedToken = <JwtPayload>await authenticateJwt(accessToken, jwtConfig);
      userId = decodedToken.userId;
    } catch (_err) {
      error = new UnauthorizedError(errors.INVALID_TOKEN);
    }
  }

  if (!userId && error) throw error;
  return userId;
}

/**
 * Middleware to check whether user is validated and has proper permissions
 */
export async function hasPermission(req: Request, _res: Response, next: NextFunction, role?: Role) {
  try {
    // Get user id via request headers
    const userId = await verifyHeaders(req);

    // Find user
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError(errors.USER_NOT_FOUND);

    // Check if user status still ok
    checkStatus(user);

    // Check if user has proper permission
    if (role && !hasRole(user, role)) {
      throw new UnauthorizedError(errors.NO_PERMISSION);
    }

    Object.assign(req, { current: { user } });
    next();
  } catch (err) {
    logger.error(`No permission for route: ${err}`);
    next(err);
  }
}

// Interfaces
export interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
