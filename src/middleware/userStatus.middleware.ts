import { Request, Response, NextFunction } from 'express';
import { authenticateJwt } from 'tree-house-authentication';
import { UnauthorizedError, NotFoundError } from 'tree-house-errors';
import { extractJwt, checkStatus } from '../lib/utils';
import { jwtConfig } from '../config/auth.config';
import { logger } from '../lib/logger';
import { errors } from '../config/errors.config';
import * as userRepository from '../repositories/user.repository';

export async function checkUserStatus(req: Request, _res: Response, next: NextFunction) {
  try {
    // Find user
    let decodedToken;
    const accessToken = extractJwt(req);
    decodedToken = <JwtPayload> await authenticateJwt(accessToken, jwtConfig);
    const user = await userRepository.findById(decodedToken.userId);
    if (!user) throw new NotFoundError(errors.USER_NOT_FOUND);
    checkStatus(user);
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
