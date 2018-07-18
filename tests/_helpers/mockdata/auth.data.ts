import { createJwt } from 'tree-house-authentication';
import { jwtConfig } from '../../../src/config/auth.config';
import { adminUser, blockedstateUser, createUser, unconfirmedUser } from './user.data';
import { User } from '../../../src/models/user.model';

const tokens = {};

export function getValidJwt(userId: string) {
  return createJwt({ userId }, jwtConfig);
}

export async function getAdminToken() {
  const user = await createUser(adminUser, 'registered');
  return await getValidJwt(user.id);
}

export async function getUserToken(user: User): Promise<string[]> {
  if (!(user.email in tokens)) {
    const token = await getValidJwt(user.id);
    tokens[user.email] = token;
  }
  return tokens[user.email];
}

export async function getUserTokens(users: User[]): Promise<string[]> {
  const tokens = [];
  for (const userValues of users) {
    const token = await getValidJwt(userValues.id);
    tokens.push(token);
  }
  return tokens;
}

export async function getUnconfirmedUserToken() {
  const user = await createUser(unconfirmedUser, 'complete_registration');
  return await getValidJwt(user.id);
}

export async function getBlockedStateUserToken() {
  const user = await createUser(blockedstateUser, 'blocked');
  return getValidJwt(user.id);
}
