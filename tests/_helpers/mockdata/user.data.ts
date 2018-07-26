import * as uuid from 'uuid';
import { roles } from '../../../src/config/roles.config';
import { tableNames } from '../../../src/constants';
import { db } from '../../../src/lib/db';
import { UserCreate } from '../../../src/models/user.model';
import * as metaRepository from '../../../src/repositories/meta.repository';
import * as userRepository from '../../../src/repositories/user.repository';

// Constants
const userStatuses = {};

export const validUser: UserCreate = {
  email: 'willem.wortel@icapps.com',
  firstName: 'Willem',
  lastName: 'Horsten',
  password: 'developer',
  role: roles.ADMIN.code,
  registrationConfirmed: true,
  status: '',
};

export const adminUser: UserCreate = {
  email: 'admin@users.com',
  firstName: 'Admin',
  lastName: 'User',
  password: 'developer',
  role: roles.ADMIN.code,
  registrationConfirmed: true,
  status: '',
};

export const regularUser: UserCreate = {
  email: 'regular@users.com',
  firstName: 'Regular',
  lastName: 'User',
  password: 'developer',
  role: roles.USER.code,
  registrationConfirmed: true,
  status: '',
};

export const unconfirmedUser: UserCreate = {
  email: 'unconfirmedUser@users.com',
  firstName: 'Regular',
  lastName: 'User',
  password: 'developer',
  role: roles.USER.code,
  registrationConfirmed: false,
  status: '',
};

export const inactiveUser: UserCreate = {
  email: 'inactive@users.com',
  firstName: 'Regular',
  lastName: 'User',
  password: 'developer',
  role: roles.USER.code,
  registrationConfirmed: true,
  status: '',
};

export const validUsers: UserCreate[] = [
  {
    email: 'willem.wortel@icapps.com',
    firstName: 'Willem',
    lastName: 'Horsten',
    password: 'developer',
    role: roles.ADMIN.code,
    registrationConfirmed: true,
  },
  {
    email: 'brent.vangeertruy@icapps.com',
    firstName: 'Brent',
    lastName: 'Van Geertruy',
    password: 'developer',
    role: roles.USER.code,
    registrationConfirmed: true,
  },
  {
    email: 'jelle.mannaerts@icapps.com',
    firstName: 'Jelle',
    lastName: 'Mannaerts',
    password: 'developer',
    role: roles.ADMIN.code,
    registrationConfirmed: true,
  },
];

/**
 * Create user status codes (only once)
 */
export async function createUserStatuses() {
  const existingCodeType = await metaRepository.findCodeTypeByCode('USER_STATUSES');
  if (!existingCodeType) {
    const codeType = await metaRepository.createCodeType({ code: 'USER_STATUSES', name: 'User Statuses' });
    userStatuses['active'] = await metaRepository.createCode(codeType.id, { code: 'ACTIVE', name: 'Active account' });
    userStatuses['inactive'] = await metaRepository.createCode(codeType.id, { code: 'INACTIVE', name: 'Inactive account' });
  }
  return userStatuses;
}

export async function createUser(values: UserCreate, status: 'active' | 'inactive') {
  await createUserStatuses(); // Create required user statuses (active/inactive)
  const allValues = Object.assign({}, values, { status: userStatuses[status].id });
  return userRepository.create(allValues);
}

export async function createUsers(users: UserCreate[], status: 'active' | 'inactive') {
  for (const userValues of users) {
    await createUser(userValues, status);
  }
  return await userRepository.findAll();
}

export function findById(id: string) {
  return userRepository.findById(id);
}

export async function setResetPwToken(userId: string) {
  const token = uuid.v4();
  await userRepository.update(userId, { resetPwToken: token });
  return token;
}

export async function removeUser(userId: string): Promise<{ affectedRows: number }> {
  return await userRepository.remove(userId);
}

/**
 * Clear all user data except admin and regular
 */
export async function clearUserData() {
  const query = db(tableNames.USERS).del().whereNotIn('email', [adminUser.email, regularUser.email]);
  return await query;
}
