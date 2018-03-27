import { User } from '../models/user.model';
import { Filters } from '../models/filters.model';
import { logger } from '../lib/logger';
import * as userRepository from '../repositories/user.repository';

/**
 * Return all users
 */
export async function getAll(filters: Filters): Promise<{ data: User[], totalCount: number }> {
  try {
    return await userRepository.getAll(filters);
  } catch (error) {
    logger.error(`An error occured in the user service: ${error}`);
    throw error;
  }
}


/**
 * Create a new user
 */
export async function create(values: User) {
  try {
    return await userRepository.create(values);
  } catch (error) {
    logger.error(`An error occured creating a user: ${error}`);
    throw error;
  }
}
