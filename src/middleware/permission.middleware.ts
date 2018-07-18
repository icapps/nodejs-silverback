import { Request, Response, NextFunction } from 'express';
import { authenticateJwt } from 'tree-house-authentication';
import { UnauthorizedError, NotFoundError } from 'tree-house-errors';
import { hasRole, extractJwt, checkStatus } from '../lib/utils';
import { logger } from '../lib/logger';
import { jwtConfig } from '../config/auth.config';
import { Role } from '../config/roles.config';
import { errors } from '../config/errors.config';
import * as userRepository from '../repositories/user.repository';

export async function hasPermission(req: Request, _res: Response, next: NextFunction, role?: Role) {
  try {
    let decodedToken;
    try {
      const accessToken = extractJwt(req);
      decodedToken = <JwtPayload> await authenticateJwt(accessToken, jwtConfig);
    } catch (err) {
      throw new UnauthorizedError(errors.INVALID_TOKEN);
    }

    // Find user
    const user = await userRepository.findById(decodedToken.userId);
    if (!user) throw new NotFoundError(errors.USER_NOT_FOUND);

    // Check if user status still ok
    checkStatus(user);

    // Check if user has proper permission
    if (role && !hasRole(user, role)) {
      throw new UnauthorizedError(errors.NO_PERMISSION);
    }

    Object.assign(req, { session: { user } });
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
