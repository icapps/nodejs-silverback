import { errors as defaults, ErrorType } from 'tree-house-errors';

// tslint:disable:max-line-length
export const errors = <Error>Object.assign({}, defaults, {
  USER_INACTIVE:      { code: 'USER_INACTIVE', message: 'Activate user account before login' },
  USER_DUPLICATE:     { code: 'USER_DUPLICATE', message: 'A user with this email already exists' },
  USER_NOT_FOUND:     { code: 'USER_NOT_FOUND', message: 'User not found' },
  MISSING_HEADERS:    { code: 'MISSING_HEADERS', message: 'Not all required headers are provided' },
  NO_PERMISSION:      { code: 'NO_PERMISSION', message:'You do not have the proper permissions to execute this operation' },
  TOO_MANY_REQUESTS:  { code: 'TOO_MANY_REQUESTS', message: 'You\'ve made too many failed attempts in a short period of time, please try again later' },
  CODE_DUPLICATE:     { code: 'CODE_DUPLICATE', message: 'A code with this code already exists' },
  USER_DELETE_OWN:    { code: 'USER_DELETE_OWN', message: 'You can\'t delete your own user' },
});
  // tslint:enable:max-line-length

export interface Error {
  [key: string]: ErrorType;
}
