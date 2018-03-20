import { User } from '../models/user.model';
import { Filters } from '../models/filters.model';
import * as userRepository from '../repositories/user.repository';

/**
 * Return all users
 */
export function getAll(filters: Filters): Promise<{ data: User[], totalCount: number }> {
  return userRepository.getAll(filters);
}
