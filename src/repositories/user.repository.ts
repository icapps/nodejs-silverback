import { db } from '../lib/db';
import { logger } from '../lib/logger';
import { Filters } from '../models/filters.model';
import { applyPagination, applySorting, applySearch } from '../lib/filter';
import { tableNames, defaultFilters } from '../constants';
import { User } from '../models/user.model';

const defaultReturnValues = ['id', 'email', 'firstName', 'lastName', 'hasAccess', 'role', 'createdAt', 'updatedAt'];

/**
 * Create new user
 */
export async function create(values: User): Promise<User> {
  const query = db.insert(values, defaultReturnValues)
    .into(tableNames.USERS);

  logger.debug(`Create new user: ${query.toString()}`);
  return await query;
}


/**
 * Return all users
 */
// TODO: Rewrite count and apply of filters into cleaner code...
export async function getAll(options: Filters = {}): Promise<{ data: User[], totalCount: number }> {
  const allOptions = Object.assign({}, defaultFilters, options);
  const searchFields = ['id', 'email', 'firstName', 'lastName'];
  const sortFields = ['email', 'firstName', 'lastName'];

  const query = db.select(defaultReturnValues)
    .from(tableNames.USERS);

  applyPagination(query, allOptions);
  applySearch(query, allOptions, searchFields);
  applySorting(query, allOptions, sortFields);
  logger.debug(`Get all users: ${query.toString()}`);

  // TODO: Investigate performance (combine into one raw query?)
  const totalCountQuery = db.count('id')
    .from(tableNames.USERS);

  applySearch(totalCountQuery, allOptions, searchFields);
  logger.debug(`Get total count users: ${totalCountQuery.toString()}`);

  const data = await query;
  const totalCount = await totalCountQuery;

  return { data, totalCount: parseInt(totalCount[0].count, 10) }; // TODO: Should we move this parsing into a seperate function (with db.count)
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
