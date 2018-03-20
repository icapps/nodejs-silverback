import { User } from '../../../src/models/user.model';
import { roles } from '../../../src/config/roles.config';
import { tableNames } from '../../../src/constants';
import { db } from '../../../src/lib/db';
import * as userRepository from '../../../src/repositories/user.repository';

export const validUser: User = {
  email: 'willem.wortel@icapps.com',
  firstName: 'Willem',
  lastName: 'Horsten',
  password: '',
  hasAccess: true,
  role: roles.ADMIN.code,
};

export const validUsers: User[] = [
  {
    email: 'willem.wortel@icapps.com',
    firstName: 'Willem',
    lastName: 'Horsten',
    password: '',
    hasAccess: true,
    role: roles.ADMIN.code,
  },
  {
    email: 'brent.vangeertruy@icapps.com',
    firstName: 'Brent',
    lastName: 'Van Geertruy',
    password: '',
    hasAccess: true,
    role: roles.USER.code,
  },
  {
    email: 'jelle.mannaerts@icapps.com',
    firstName: 'Jelle',
    lastName: 'Mannaerts',
    password: '',
    hasAccess: false,
    role: roles.ADMIN.code,
  },
];

export async function createUsers(users: User[]) {
  for (const userValues of users) {
    await userRepository.create(userValues);
  }
  return await userRepository.getAll();
}

export function createUser(values: User) {
  return userRepository.create(values);
}

export function resetUserData() {
  return db(tableNames.USERS).del();
}
