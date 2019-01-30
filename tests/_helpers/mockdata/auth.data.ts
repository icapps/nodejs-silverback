import * as request from 'supertest';
import { createJwt } from 'tree-house-authentication';
import { jwtConfig } from '../../../src/config/auth.config';
import { adminUser, createUser } from './user.data';
import { User, UserCreate } from '../../../src/models/user.model';
import { app } from '../../../src/app';

const prefix = `/api/${process.env.API_VERSION}`;
const sessionTokens = {};
const jwtTokens = {};

/**
 * Login with username and password
 * Return the cookie that needs to be set
 */
async function login(email: string, password: string): Promise<string> {
  const { header } = await request(app)
    .post(`${prefix}/auth/login`)
    .send({ email, password });

  return header['set-cookie'];
}

export function getValidJwt(userId: string) {
  return createJwt({ userId }, jwtConfig);
}

/**
 * Get a valid user token (cookie)
 * We don't want to login every time again, so store already logged in users
 */
export async function getUserSessionToken(user: UserCreate): Promise<string[]> {
  if (!(user.email in sessionTokens)) {
    const token = await login(user.email, user.password);
    sessionTokens[user.email] = token;
  }
  return sessionTokens[user.email];
}

export async function getUserSessionsTokens(users: UserCreate[]): Promise<string[]> {
  const sessionTokens = [];
  for (const userValues of users) {
    const token = await getUserSessionToken(userValues);
    sessionTokens.push(token);
  }
  return sessionTokens;
}

/**
 * Get a valid user token (cookie)
 * We don't want to login every time again, so store already logged in users
 */
export async function getUserJwtToken(user: User): Promise<string[]> {
  if (!(user.email in jwtTokens)) {
    const token = await getValidJwt(user.id);
    jwtTokens[user.email] = token;
  }
  return jwtTokens[user.email];
}

export async function getUserJwtTokens(users: User[]): Promise<string[]> {
  const jwtTokens = [];
  for (const userValues of users) {
    const token = await getValidJwt(userValues.id);
    jwtTokens.push(token);
  }
  return jwtTokens;
}

export async function getAdminToken() {
  const user = await createUser(adminUser, 'active');
  return await getValidJwt(user.id);
}
