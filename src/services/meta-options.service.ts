import { Code } from '../models/code.model';
import { Filters } from '../models/filters.model';
import * as metaOptionsRepository from '../repositories/meta-options.repository';

/**
 * Return all meta-options
 */
export function getAll(filters: Filters): Promise<{ data: Code[], totalCount: number }> {
  return metaOptionsRepository.getAll(filters);
}
