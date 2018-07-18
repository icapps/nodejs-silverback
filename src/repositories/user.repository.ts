import { getHashedPassword } from 'tree-house-authentication';
import { db, selectAndCount, parseTotalCount, execAndFind } from '../lib/db';
import { settings } from '../config/app.config';
import { logger } from '../lib/logger';
import { Filters } from '../models/filters.model';
import { User, UserUpdate, UserCreate, PartialUserUpdate } from '../models/user.model';
import { findRoleByCode } from '../lib/utils';
import { applyPagination, applySorting, applySearch } from '../lib/filter';
import { tableNames, defaultFilters, viewNames } from '../constants';
import { Code } from '../models/code.model';

// Makes it easier for joins
const aliases = {
  USERS: 'u',
  STATUSES: 'us',
};

const defaultReturnValues = [
  `${aliases.USERS}.id`,
  `${aliases.USERS}.email`,
  `${aliases.USERS}.password`,
  `${aliases.USERS}.firstName`,
  `${aliases.USERS}.lastName`,
  `${aliases.USERS}.status`,
  `${aliases.USERS}.role`,
  `${aliases.USERS}.resetPwToken`,
  `${aliases.USERS}.refreshToken`,
  `${aliases.USERS}.createdAt`,
  `${aliases.USERS}.updatedAt`,
];

// Values incl. statuses
const extendedReturnValues = [...defaultReturnValues, ...[
  `${aliases.STATUSES}.code AS status.code`,
  `${aliases.STATUSES}.name AS status.name`,
]];

/**
 * Create new user
 */
export async function create(values: UserCreate): Promise<User> {
  // Hash the password before inserting
  const hashedPw = await getHashedPassword(values.password, settings.saltCount);
  const valuesToInsert = Object.assign({}, values, { password: hashedPw });

  const query = db(tableNames.USERS)
    .insert(valuesToInsert, ['id']);

  logger.debug(`Create new user: ${query.toString()}`);
  return await execAndFind(query, 'id', findById);
}

/**
 * Update an existing user
 */
export async function update(userId: string, values: UserUpdate | PartialUserUpdate): Promise<User> {
  const query = db(tableNames.USERS)
    .update(values, ['id'])
    .where('id', userId);

  logger.debug(`Update existing user: ${query.toString()}`);
  return await execAndFind(query, 'id', findById);
}

/**
 * Update the password of an existing user
 */
export async function updatePassword(userId: string, password: string): Promise<User> {
  const hashedPw = await getHashedPassword(password, settings.saltCount);
  const userStatus = await findUserStatus('REGISTERED');
  return update(userId, { password: hashedPw, resetPwToken: null, status: userStatus.id });
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
  const searchFields = [`${aliases.USERS}.id`, 'email', 'firstName', 'lastName'];
  const sortFields = ['email', 'firstName', 'lastName', 'role', `${aliases.STATUSES}.code`];

  const query = selectAndCount(db, extendedReturnValues)
    .from(`${tableNames.USERS} as ${aliases.USERS}`)
    .join(`${viewNames.USER_STATUSES} as ${aliases.STATUSES}`, `${aliases.USERS}.status`, `${aliases.STATUSES}.id`);

  applyPagination(query, allOptions);
  applySearch(query, allOptions, searchFields);

  // if sortField is status, replace status with us.code for sorting on status code property
  if (allOptions.sortField === 'status') Object.assign(allOptions, { sortField: `${aliases.STATUSES}.code` });

  applySorting(query, allOptions, sortFields, { field: 'email', order: 'desc' });
  logger.debug(`Get all users: ${query.toString()}`);

  const data = (await query).map(x => Object.assign(x, { role: findRoleByCode(x.role) })); // Add full role object
  return { data, totalCount: parseTotalCount(data) };
}

/**
 * Get a user by id
 */
export async function findById(id: string): Promise<User> {
  const query = db(`${tableNames.USERS} as ${aliases.USERS}`)
    .select(extendedReturnValues)
    .join(`${viewNames.USER_STATUSES} as ${aliases.STATUSES}`, `${aliases.USERS}.status`, `${aliases.STATUSES}.id`)
    .where(`${aliases.USERS}.id`, id)
    .first();

  logger.debug(`Get user by id: ${query.toString()}`);
  const data = await query;
  return data ? Object.assign(data, { role: findRoleByCode(data.role) }) : undefined; // Add full role object
}

/**
 * Find a user by email
 */
export async function findByEmail(email: string): Promise<User | undefined> {
  const query = db(`${tableNames.USERS} as ${aliases.USERS}`)
    .select(extendedReturnValues)
    .join(`${viewNames.USER_STATUSES} as ${aliases.STATUSES}`, `${aliases.USERS}.status`, `${aliases.STATUSES}.id`)
    .whereRaw(`LOWER(${aliases.USERS}.email)=LOWER(?)`, [email])
    .first();

  logger.debug(`Get user by email: ${query.toString()}`);
  const data = await query;
  return data ? Object.assign(data, { role: findRoleByCode(data.role) }) : undefined; // Add full role object
}

/**
 * Find a user via their reset password token
 */
export async function findByResetToken(token: string): Promise<User | undefined> {
  const query = db(`${tableNames.USERS} as ${aliases.USERS}`)
    .select(defaultReturnValues)
    .where(`${aliases.USERS}.resetPwToken`, token)
    .first();

  logger.debug(`Get user by reset password token: ${query.toString()}`);
  return await query;
}

/**
 * Find a user via their refresh token and user id
 */
export async function findByRefreshToken(userId: string, token: string): Promise<User | undefined> {
  const query = db(`${tableNames.USERS} as ${aliases.USERS}`)
    .select(defaultReturnValues)
    .where(`${aliases.USERS}.refreshToken`, token)
    .andWhere(`${aliases.USERS}.id`, userId)
    .first();

  logger.debug(`Get user by refresh token: ${query.toString()}`);
  return await query;
}

/**
 * Find user status by code
 */
export async function findUserStatus(code: string): Promise<Code> {
  const query = db(viewNames.USER_STATUSES)
    .select()
    .where('code', code)
    .first();

  logger.debug(`Get user status: ${query.toString()} `);
  return await query;
}
