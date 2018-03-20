import { Request, Response, NextFunction } from 'express';
import { authenticateJwt } from 'tree-house-authentication';
import { UnauthorizedError, NotFoundError } from 'tree-house-errors';
import { hasRole, extractJwt } from '../lib/utils';
import { logger } from '../lib/logger';
import { jwtConfig } from '../config/auth.config';
import { Role } from '../config/roles.config';
import * as userRepository from '../repositories/user.repository';

export async function hasPermission(req: Request, _res: Response, next: NextFunction, role?: Role) {
  try {
    const accessToken = extractJwt(req);
    const decodedToken = <JwtPayload>await authenticateJwt(accessToken, jwtConfig);

    // Find user
    const user = await userRepository.getById(decodedToken.userId);
    if (!user) throw new NotFoundError(); // TODO: Custom error message?

    // Check if user has proper permission
    if (role && !hasRole(user, role)) {
      throw new UnauthorizedError(); // TODO: Custom error message?
    }

    Object.assign(req, { session: { user } });
    next();
  } catch (err) {
    logger.error(`No permission for route: ${err.message}`);
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
