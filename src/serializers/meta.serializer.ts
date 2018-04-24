import { Serializer } from 'jsonade';

export const codeSerializer = new Serializer('codes', {
  keyForAttribute: 'camelCase',
  attributes: [
    'id',
    'code',
    'name',
    'description',
    'isActive',
    'createdAt',
    'updatedAt',
  ],
});
