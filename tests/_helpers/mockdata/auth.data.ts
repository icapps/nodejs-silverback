import { createJwt } from 'tree-house-authentication';
import { jwtConfig } from '../../../src/config/auth.config';
import { createUser, adminUser, regularUser } from './user.data';
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
