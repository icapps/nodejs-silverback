export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface FilterOptions {
  search?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  deprecated?: true | false;
}

export interface Filters extends PaginationOptions, FilterOptions { }
