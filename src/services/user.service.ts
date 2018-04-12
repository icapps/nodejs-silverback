import { NotFoundError, BadRequestError } from 'tree-house-errors';
import { User, UserCreate, UserUpdate, PartialUserUpdate } from '../models/user.model';
import { Filters } from '../models/filters.model';
import { logger } from '../lib/logger';
import * as userRepository from '../repositories/user.repository';


/**
 * Return a user by id
 */
export async function findById(userId: string): Promise<User> {
  const result = await userRepository.findById(userId);
  if (!result) throw new NotFoundError();
  return result;
}


/**
 * Return all users
 */
export async function findAll(filters: Filters): Promise<{ data: User[], totalCount: number }> {
  try {
    return await userRepository.findAll(filters);
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
    const user = await userRepository.findByEmail(values.email);
    if (user) throw new BadRequestError(); // TODO: Custom error message

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
 * Update existing properties of a user
 */
export async function partialUpdate(userId: string, values: PartialUserUpdate): Promise<User> {
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
