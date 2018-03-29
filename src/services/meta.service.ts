import { CodeType } from '../models/code-type.model';
import { Code, CodeFilters } from '../models/code.model';
import { Filters } from '../models/filters.model';
import * as metaRepository from '../repositories/meta.repository';
import { logger } from '../lib/logger';

/**
 * Return all codeTypes
 */
export function findAllCodeTypes(filters: Filters): Promise<{ data: CodeType[], totalCount: number }> {
  try {
    return metaRepository.findAllCodeTypes(filters);
  } catch (error) {
    logger.error(`An error occured in the meta service: ${error}`);
    throw error;
  }
}

/**
 * Return all codes
 */
export function findAllCodes(filters: CodeFilters): Promise<{ data: Code[], totalCount: number }> {
  try {
    return metaRepository.findAllCodes(filters);
  } catch (error) {
    logger.error(`An error occured in the meta service: ${error}`);
    throw error;
  }
}
