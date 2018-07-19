import * as request from 'supertest';
import { createJwt } from 'tree-house-authentication';
import { jwtConfig } from '../../../src/config/auth.config';
import { adminUser, blockedUser, createUser, unconfirmedUser } from './user.data';
import { User } from '../../../src/models/user.model';
import { app } from '../../../src/app';

const prefix = `/api/${process.env.API_VERSION}`;
const tokens = {};

/**
 * Login with username and password
 * Return the cookie that needs to be set
 */
async function login(username: string, password: string): Promise<string> {
  const { header } = await request(app)
    .post(`${prefix}/auth/login`)
    .send({ username, password });
  return header['set-cookie'];
}

export function getValidJwt(userId: string) {
  return createJwt({ userId }, jwtConfig);
}

/**
 * Get a valid user token (cookie)
 * We don't want to login every time again, so store already logged in users
 */
export async function getUserSessionToken(user: User): Promise<string[]> {
  if (!(user.email in tokens)) {
    const token = await login(user.email, user.password);
    tokens[user.email] = token;
  }
  return tokens[user.email];
}

/**
 * Get a valid user token (cookie)
 * We don't want to login every time again, so store already logged in users
 */
export async function getUserJwtToken(user: User): Promise<string[]> {
  if (!(user.email in tokens)) {
    const token = await getValidJwt(user.id);
    tokens[user.email] = token;
  }
  return tokens[user.email];
}

export async function getUserJwtTokens(users: User[]): Promise<string[]> {
  const tokens = [];
  for (const userValues of users) {
    const token = await getValidJwt(userValues.id);
    tokens.push(token);
  }
  return tokens;
}

export async function getAdminToken() {
  const user = await createUser(adminUser, 'registered');
  return await getValidJwt(user.id);
}

export async function getUnconfirmedUserToken() {
  const user = await createUser(unconfirmedUser, 'complete_registration');
  return await getValidJwt(user.id);
}

export async function getBlockedStateUserToken() {
  const user = await createUser(blockedUser, 'blocked');
  return getValidJwt(user.id);
}
