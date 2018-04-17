import { Serializer } from 'jsonade';

export const roleSerializer = new Serializer('roles', {
  keyForAttribute: 'camelCase',
  attributes: [
    'code',
    'name',
    'level',
    'description',
  ],
});
