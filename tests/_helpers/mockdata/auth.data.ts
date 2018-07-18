import { createJwt } from 'tree-house-authentication';
import { jwtConfig } from '../../../src/config/auth.config';
import { createUser, adminUser, regularUser, unconfirmedUser, nostateUser, blockedstateUser } from './user.data';
import { roles } from '../../../src/config/roles.config';

export function getValidJwt(userId: string) {
  return createJwt({ userId }, jwtConfig);
}

export async function getAdminToken() {
  const user = await createUser(adminUser, 'registered');
  return await getValidJwt(user.id);
}

export async function getUserToken() {
  const user = await createUser(regularUser, 'registered');
  return await getValidJwt(user.id);
}

export async function getUnconfirmedUserToken() {
  const user = await createUser(unconfirmedUser, 'complete_registration');
  return await getValidJwt(user.id);
}

export async function getBlockedStateUserToken() {
  const user = await createUser(blockedstateUser, 'blocked');
  return getValidJwt(user.id);
}
