import { db, selectAndCount, parseTotalCount } from '../lib/db';
import { settings } from '../config/app.config';
import { logger } from '../lib/logger';
import { Filters } from '../models/filters.model';
import { applyPagination, applySorting, applySearch } from '../lib/filter';
import { tableNames, defaultFilters } from '../constants';
import { User, UserUpdate, UserCreate, PartialUserUpdate } from '../models/user.model';
import { getHashedPassword } from 'tree-house-authentication';
const defaultReturnValues = ['id', 'email', 'password', 'firstName', 'lastName', 'hasAccess', 'role', 'resetPwToken', 'createdAt', 'updatedAt'];

/**
 * Create new user
 */
export async function create(values: UserCreate): Promise<User> {
  // Hash the password before inserting
  const hashedPw = await getHashedPassword(values.password, settings.saltCount);
  const valuesToInsert = Object.assign({}, values, { password: hashedPw });

  const query = db(tableNames.USERS)
    .insert(valuesToInsert, defaultReturnValues);

  logger.debug(`Create new user: ${query.toString()}`);
  return (await query)[0];
}


/**
 * Update an existing user
 */
export async function update(userId: string, values: UserUpdate | PartialUserUpdate): Promise<User> {
  // TODO: UpdateAt!!
  const query = db(tableNames.USERS)
    .update(values, defaultReturnValues)
    .where('id', userId);

  logger.debug(`Update existing user: ${query.toString()}`);
  return (await query)[0];
}


/**
 * Remove an existing user
 */
export async function remove(userId: string): Promise<{ affectedRows: number }> {
  const query = db(tableNames.USERS)
    .del()
    .where('id', userId);

  logger.debug(`Delete existing user: ${query.toString()}`);
  return { affectedRows: (await query) };
}


/**
 * Return all users
 */
export async function findAll(options: Filters = {}): Promise<{ data: User[], totalCount: number }> {
  const allOptions = Object.assign({}, defaultFilters, options);
  const searchFields = ['id', 'email', 'firstName', 'lastName'];
  const sortFields = ['email', 'firstName', 'lastName'];

  const query = selectAndCount(db, defaultReturnValues)
    .from(tableNames.USERS);

  applyPagination(query, allOptions);
  applySearch(query, allOptions, searchFields);
  applySorting(query, allOptions, sortFields);
  logger.debug(`Get all users: ${query.toString()}`);

  const data = await query;
  return { data, totalCount: parseTotalCount(data) };
}


/**
 * Get a user by id
 */
export async function findById(id: string): Promise<User> {
  const query = db(tableNames.USERS)
    .select(defaultReturnValues)
    .where('id', id)
    .first();

  logger.debug(`Get user by id: ${query.toString()}`);
  return await query;
}


/**
 * Find a user by email
 */
export async function findByEmail(email: string): Promise<User | undefined> {
  const query = db(tableNames.USERS)
    .select(defaultReturnValues)
    .where('email', email)
    .first();

  logger.debug(`Get user by email: ${query.toString()}`);
  return await query;
}


/**
 * Find a user via their reset password token
 */
export async function findByResetToken(token: string): Promise<User | undefined> {
  const query = db(tableNames.USERS)
    .select(defaultReturnValues)
    .where('resetPwToken', token)
    .first();

  logger.debug(`Get user by reset password token: ${query.toString()}`);
  return await query;
}
