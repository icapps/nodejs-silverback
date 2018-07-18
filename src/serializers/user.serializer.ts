import { Serializer } from 'jsonade';

export const userSerializer = new Serializer('users', {
  keyForAttribute: 'camelCase',
  attributes: [
    'id',
    'email',
    'firstName',
    'lastName',
    'role',
    'status',
    'createdAt',
    'updatedAt',
  ],
  role: {
    attributes: [
      'name',
      'code',
      'description',
      'level',
    ],
  },
  status: {
    attributes: [
      'name',
      'code',
      'description',
    ],
  },
});
