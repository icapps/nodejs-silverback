import { User } from '../../../src/models/user.model';
import { roles } from '../../../src/config/roles.config';
import { tableNames } from '../../../src/constants';
import { db } from '../../../src/lib/db';
import * as userRepository from '../../../src/repositories/user.repository';

export const validUser: User = {
  email: 'willem.wortel@icapps.com',
  firstName: 'Willem',
  lastName: 'Horsten',
  password: 'prutser123',
  hasAccess: true,
  role: roles.ADMIN.code,
};

export const adminUser: User = {
  email: 'admin@users.com',
  firstName: 'Admin',
  lastName: 'User',
  password: 'prutser123',
  role: roles.ADMIN.code,
  hasAccess: true,
};

export const regularUser: User = {
  email: 'regular@users.com',
  firstName: 'Regular',
  lastName: 'User',
  password: 'prutser123',
  role: roles.USER.code,
  hasAccess: true,
};

export const validUsers: User[] = [
  {
    email: 'willem.wortel@icapps.com',
    firstName: 'Willem',
    lastName: 'Horsten',
    password: 'prutser123',
    hasAccess: true,
    role: roles.ADMIN.code,
  },
  {
    email: 'brent.vangeertruy@icapps.com',
    firstName: 'Brent',
    lastName: 'Van Geertruy',
    password: 'prutser123',
    hasAccess: true,
    role: roles.USER.code,
  },
  {
    email: 'jelle.mannaerts@icapps.com',
    firstName: 'Jelle',
    lastName: 'Mannaerts',
    password: 'prutser123',
    hasAccess: false,
    role: roles.ADMIN.code,
  },
];

export async function createUsers(users: User[]) {
  for (const userValues of users) {
    await userRepository.create(userValues);
  }
  return await userRepository.findAll();
}

export function createUser(values: User) {
  return userRepository.create(values);
}

export function findById(id: string) {
  return userRepository.findById(id);
}

/**
 * Clear all user data except admin and regular
 */
export async function clearUserData() {
  const query = db(tableNames.USERS).del().whereNotIn('email', [adminUser.email, regularUser.email]);
  return await query;
}
