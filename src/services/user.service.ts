import { User, UserCreate, UserUpdate } from '../models/user.model';
import { Filters } from '../models/filters.model';
import { logger } from '../lib/logger';
import * as userRepository from '../repositories/user.repository';
import { NotFoundError } from 'tree-house-errors';

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
    const result = await userRepository.update(userId, values);
    if (!result) throw new NotFoundError();
    return result;
  } catch (error) {
    logger.error(`An error occured updating a user: ${error}`);
    throw error;
  }
}


/**
 * Remove an existing user
 */
export async function remove(userId: string): Promise<{}> {
  try {
    const result = await userRepository.remove(userId);
    if (result.affectedRows === 0) throw new NotFoundError();
    return result;
  } catch (error) {
    logger.error(`An error occured removing a user: ${error}`);
    throw error;
  }
}
