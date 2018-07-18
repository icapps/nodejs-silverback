import * as knex from 'knex';
import { Filters } from '../models/filters.model';

/**
 * Apply pagination to a query
 */
export function applyPagination(query: knex.QueryBuilder, filters: Filters): void {
  if (filters.limit) query.limit(filters.limit);
  if (filters.offset) query.offset(filters.offset);
}

/**
 * Apply basic sorting to a query (field must be available for sorting)
 * query can be 'any' due to outdated knex typings file (no support for clearOrder)
 */
export function applySorting(query: knex.QueryBuilder | any, filters: Filters, availableFields: string[] = [], defaultSort?: DefaultSorting): void {
  if (defaultSort) query.orderBy(defaultSort.field, defaultSort.order === 'desc' ? 'desc' : 'asc');
  if (filters.sortOrder && filters.sortField) {
    if (availableFields.includes(filters.sortField)) {
      query.clearOrder();
      query.orderBy(filters.sortField, filters.sortOrder === 'desc' ? 'desc' : 'asc');
    }
  }
}

/**
 * Apply search functionality to a query (field must be available for search)
 */
export function applySearch(query: knex.QueryBuilder, filters: Filters, availableFields: string[] = []): void {
  if (filters.search) {
    availableFields.forEach((field, index) => {
      index === 0
        ? query.whereRaw('??::text ilike ?', [field, `%${filters.search}%`]) // Casting needed for id types
        : query.orWhereRaw('??::text ilike ?', [field, `%${filters.search}%`]);
    });
  }
}

// Interfaces
export interface DefaultSorting {
  field: string;
  order: string;
}
