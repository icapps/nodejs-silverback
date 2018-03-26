import { db, selectAndCount, parseTotalCount } from '../lib/db';
import { settings } from '../config/app.config';
import { logger } from '../lib/logger';
import { Filters } from '../models/filters.model';
import { applyPagination, applySorting, applySearch } from '../lib/filter';
import { tableNames, defaultFilters } from '../constants';
import { User } from '../models/user.model';
import { getHashedPassword } from 'tree-house-authentication';
const defaultReturnValues = ['id', 'email', 'password', 'firstName', 'lastName', 'hasAccess', 'role', 'createdAt', 'updatedAt'];

/**
 * Create new user
 */
export async function create(values: User): Promise<User> {
  // Hash the password before inserting
  const hashedPw = await getHashedPassword(values.password, settings.saltCount);
  const valuesToInsert = Object.assign({}, values, { password: hashedPw });

  const query = db.insert(valuesToInsert, defaultReturnValues)
    .into(tableNames.USERS);

  logger.debug(`Create new user: ${query.toString()}`);
  return await query;
}


/**
 * Return all users
 */
export async function getAll(options: Filters = {}): Promise<{ data: User[], totalCount: number }> {
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
export async function getById(id: string): Promise<User> {
  const query = db.select(defaultReturnValues)
    .where('id', id)
    .from(tableNames.USERS)
    .first();

  logger.debug(`Get user by id: ${query.toString()}`);
  return await query;
}


/**
 * Find a user by email
 */
export async function findByEmail(email: string): Promise<User | undefined> {
  const query = db.select(defaultReturnValues)
    .where('email', email)
    .from(tableNames.USERS)
    .first();

  logger.debug(`Get user by email: ${query.toString()}`);
  return await query;
}
