import { errors as defaults } from 'tree-house-errors';

export const errors = Object.assign({}, defaults, {
  USER_INACTIVE:      { code: 'USER_INACTIVE', message: 'Activate user account before login' },
  USER_DUPLICATE:     { code: 'USER_DUPLICATE', message: 'A user with this email already exists' },
  USER_NOT_FOUND:     { code: 'USER_NOT_FOUND', message: 'User not found' },
  MISSING_HEADERS:    { code: 'MISSING_HEADERS', message: 'Not all required headers are provided' },
  NO_PERMISSION:      { code: 'NO_PERMISSION', message:'You do not have the proper permissions to execute this operation' },
});
