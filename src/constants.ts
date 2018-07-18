import { Filters } from './models/filters.model';

export const errorTranslations = `${process.cwd()}/locales`;

export const envs = {
  TEST: 'test',
  DEVELOP: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
};

export const tableNames = {
  USERS: 'users',
  CODES: 'codes',
  CODETYPES: 'code_types',
};

export const viewNames = {
  USER_STATUSES: 'user_statuses_view',
};

export const defaultFilters: Filters = {
  limit: 50,
  offset: 0,
};

export const mailTemplates = {
  FORGOT_PW_INIT: '00-forgot-password',
  SET_INITIAL_PW: '01-initial-password',
};
