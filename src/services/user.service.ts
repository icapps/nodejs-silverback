import { User, UserCreate, UserUpdate } from '../models/user.model';
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
export async function create(values: UserCreate): Promise<User> {
  try {
    return await userRepository.create(values);
  } catch (error) {
    logger.error(`An error occured creating a user: ${error}`);
    throw error;
  }
}


/**
 * Update existing user
 */
export async function update(userId: string, values: UserUpdate): Promise<User> {
  try {
    return await userRepository.update(userId, values);
  } catch (error) {
    logger.error(`An error occured updating a user: ${error}`);
    throw error;
  }
}
