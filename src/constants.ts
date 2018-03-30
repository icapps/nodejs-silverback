import { Filters } from './models/filters.model';

export const tableNames = {
  USERS: 'users',
  CODES: 'codes',
  CODETYPES: 'code_types',
};

export const defaultFilters: Filters = {
  limit: 50,
  offset: 0,
};

export const mailTemplates = {
  FORGOT_PW_INIT: '00-forgot-password',
};
