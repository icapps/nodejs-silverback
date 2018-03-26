import { Filters } from './models/filters.model';

export const tableNames = {
  USERS: 'users',
  CODES: 'codes',
  CODETYPES: 'codeTypes',
};

export const defaultFilters: Filters = {
  limit: 50,
  offset: 0,
};
