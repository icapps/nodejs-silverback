import { Request } from 'express';
import { UnauthorizedError } from 'tree-house-errors';
import { Role, roles } from '../config/roles.config';
import { User } from '../models/user.model';
import { errors } from '../config/errors.config';

/**
 * Check whether a user has the correct role level or higher
 */
export function hasRole(user: User, role: Role): boolean {
  return user.role.level >= role.level;
}


/**
 * Find a user role by code
 */
export function findRoleByCode(code: string): Role {
  return roles[Object.keys(roles).find(x => roles[x].code === code)];
}


/**
 * Snake_case strings in an array
 */
export function snakeCaseArray(arr: string[]): string[] {
  return arr.map((x) => {
    const snakeCased = x.replace(/([A-Z])/g, '_$1').toLowerCase();
    return snakeCased.indexOf('.') ? `"${snakeCased.replace(/\./g, '"."')}"` : snakeCased;
  });
}


/**
 * Return the jwt token from the headers of an Express request
 */
export function extractJwt(req: Request) {
  const headers = req.headers['authorization'] as string;
  if (!headers) throw new UnauthorizedError(errors.MISSING_HEADERS);

  // Get accessToken out of header
  if (headers.split(' ')[0] !== 'Bearer') throw new UnauthorizedError(errors.MISSING_HEADERS);
  return headers.split(' ')[1];
}
