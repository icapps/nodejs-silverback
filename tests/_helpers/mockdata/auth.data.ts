import { createJwt } from 'tree-house-authentication';
import { jwtConfig } from '../../../src/config/auth.config';

export function getValidJwt(userId: string) {
  return createJwt({ userId }, jwtConfig);
}
