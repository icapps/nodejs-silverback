import { errors as defaults } from 'tree-house-errors';

export const errors = Object.assign({}, defaults, {
  USER_INACTIVE: { code: 'USER_INACTIVE', message: 'Activate user account before login' },
});
