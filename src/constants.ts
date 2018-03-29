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
