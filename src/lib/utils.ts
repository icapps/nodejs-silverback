import { Role, roles } from '../config/roles.config';
import { User } from '../models/user.model';

/**
 * Check whether a user has the correct role level or higher
 */
export function hasRole(user: User, role: Role): boolean {
  const userRole = roles[Object.keys(roles).find(x => roles[x].code === user.role)];
  return userRole.level >= role.level;
}
