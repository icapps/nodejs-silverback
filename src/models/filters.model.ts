export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface FilterOptions {
  search?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  showDeprecated?: boolean;
}

export interface Filters extends PaginationOptions, FilterOptions { }
