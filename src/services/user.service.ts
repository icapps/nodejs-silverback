import * as uuid from 'uuid';
import * as crypto from 'crypto';
import { NotFoundError, BadRequestError } from 'tree-house-errors';
import { getHashedPassword } from 'tree-house-authentication';
import { User, UserCreate, UserUpdate, PartialUserUpdate } from '../models/user.model';
import { Filters } from '../models/filters.model';
import { logger } from '../lib/logger';
import { getInitialPwChangeContent } from '../templates/initial-pw.mail.template';
import { errors } from '../config/errors.config';
import { settings } from '../config/app.config';
import * as userRepository from '../repositories/user.repository';
import * as mailer from '../lib/mailer';

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
export async function create(values: UserCreate, changePassword: boolean): Promise<User> {
  try {
    const user = await userRepository.findByEmail(values.email);
    if (user) throw new BadRequestError(errors.USER_DUPLICATE);

    const userStatus = await userRepository.findUserStatus(values.status);
    if (!userStatus) throw new NotFoundError(errors.STATUS_NOT_FOUND);

    const valuesWithStatusId = Object.assign({}, values, { status: userStatus.id, registrationConfirmed: true });

    // User must set own password after creation
    if (changePassword === true) {
      const token = uuid.v4();
      const randomPassword = await getHashedPassword(crypto.randomBytes(24).toString('hex'), settings.saltCount);
      const created = await userRepository.create(Object.assign({}, valuesWithStatusId, {
        resetPwToken: token,
        password: randomPassword,
        registrationConfirmed: false, // Needs to confirm by email
      }));

      // Send mail asynchronous, no need to wait
      const content = getInitialPwChangeContent({ token, email: values.email, firstName: created.firstName });
      mailer.sendTemplate(content, mailer.getDefaultClient());

      return created;
    }

    return await userRepository.create(valuesWithStatusId);
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
    const userStatus = await userRepository.findUserStatus(values.status);
    if (!userStatus) throw new NotFoundError(errors.STATUS_NOT_FOUND);

    const valuesWithStatusId = Object.assign({}, values, { status: userStatus.id });

    const result = await userRepository.update(userId, valuesWithStatusId);
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
    if (values.status) {
      const userStatus = await userRepository.findUserStatus(values.status);
      if (!userStatus) throw new NotFoundError(errors.STATUS_NOT_FOUND);
      Object.assign(values, { status: userStatus.id });
    }

    const result = await userRepository.update(userId, values);
    if (!result) throw new NotFoundError();
    return result;
  } catch (error) {
    logger.error(`An error occured updating a user: ${error}`);
    throw error;
  }
}

/**
 * Update a user's password
 */
export async function updatePassword(userId: string, password: string): Promise<{}> {
  try {
    const hashedPw = await getHashedPassword(password, settings.saltCount);
    return await partialUpdate(userId, { password: hashedPw, status: 'ACTIVE' });
  } catch (error) {
    logger.error(`An error occured updating a user's password: ${error}`);
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
