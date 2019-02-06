import { errors as defaults, ErrorType } from 'tree-house-errors';

const asType = <T extends { [key: string]: ErrorType }>(arg: T): T  => arg;

// tslint:disable:max-line-length
export const errors = asType({...defaults, ... {
  CODE_DUPLICATE:             { code: 'CODE_DUPLICATE', message: 'An item with this code already exists' },
  INVALID_TOKEN:              { code: 'INVALID_TOKEN', message: 'The supplied token is invalid.' },
  LINK_EXPIRED:               { code: 'LINK_EXPIRED', message: 'Sorry, but this link has expired. You can request another one below.' },
  MISSING_HEADERS:            { code: 'MISSING_HEADERS', message: 'Not all required headers are provided' },
  NO_PERMISSION:              { code: 'NO_PERMISSION', message:'You do not have the proper permissions to execute this operation' },
  TOO_MANY_REQUESTS:          { code: 'TOO_MANY_REQUESTS', message: 'You\'ve made too many failed attempts in a short period of time, please try again later' },
  USER_DELETE_OWN:            { code: 'USER_DELETE_OWN', message: 'You can\'t delete your own user' },
  USER_DUPLICATE:             { code: 'USER_DUPLICATE', message: 'A user with this email already exists' },
  USER_INACTIVE:              { code: 'USER_INACTIVE', message: 'Your account is inactive. Please contact your administrator.' },
  USER_UNCONFIRMED:           { code: 'USER_UNCONFIRMED', message: 'Your account is not confirmed. Please check your inbox for the confirmation link.' },
  USER_INVALID_CREDENTIALS:   { code: 'USER_INVALID_CREDENTIALS', message: 'Incorrect username or password. Please try again.' },
  USER_NOT_FOUND:             { code: 'USER_NOT_FOUND', message: 'User not found' },
  STATUS_NOT_FOUND:           { code: 'STATUS_NOT_FOUND', message: 'Status not found' },
}});
// tslint:enable:max-line-length
