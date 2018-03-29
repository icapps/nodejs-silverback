import { Filters } from './filters.model';

export interface Code {
  id?: string;
  value: string;
}

export interface CodeFilters extends Filters {
  codeId: string;
}
