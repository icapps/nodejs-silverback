import { Serializer } from 'jsonade';

export const authSerializer = new Serializer('authentication', {
  keyForAttribute: 'camelCase',
  attributes: [
    'accessToken',
    'refreshToken',
  ],
});
