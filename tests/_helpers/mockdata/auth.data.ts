import { createJwt } from 'tree-house-authentication';
import { jwtConfig } from '../../../src/config/auth.config';
import { createUser, adminUser, regularUser, unconfirmedUser, nostateUser, blockedstateUser } from './user.data';
import { roles } from '../../../src/config/roles.config';

export function getValidJwt(userId: string) {
  return createJwt({ userId }, jwtConfig);
}

export async function getAdminToken() {
  const user = await createUser(adminUser);
  return await getValidJwt(user.id);
}

export async function getUserToken() {
  const user = await createUser(regularUser);
  return await getValidJwt(user.id);
}

export async function getUnconfirmedUserToken() {
  const user = await createUser(unconfirmedUser);
  return await getValidJwt(user.id);
}

export async function getNoStateUserToken() {
  const user = await createUser(nostateUser);
  return getValidJwt(user.id);
}

export async function getBlockedStateUserToken() {
  const user = await createUser(blockedstateUser);
  return getValidJwt(user.id);
}
