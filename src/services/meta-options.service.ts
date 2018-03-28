import { CodeType } from '../models/code-type.model';
import { Code, CodeFilters } from '../models/code.model';
import { Filters } from '../models/filters.model';
import * as metaOptionsRepository from '../repositories/meta-options.repository';
import { logger } from '../lib/logger';

/**
 * Return all codeTypes
 */
export function findAllCodeTypes(filters: Filters): Promise<{ data: CodeType[], totalCount: number }> {
  try {
    return metaOptionsRepository.findAllCodeTypes(filters);
  } catch (error) {
    logger.error(`An error occured in the metaOptions service: ${error}`);
    throw error;
  }
}

/**
 * Return all codes
 */
export function findAllCodes(filters: CodeFilters): Promise<{ data: Code[], totalCount: number }> {
  try {
    return metaOptionsRepository.findAllCodes(filters);
  } catch (error) {
    logger.error(`An error occured in the metaOptions service: ${error}`);
    throw error;
  }
}
