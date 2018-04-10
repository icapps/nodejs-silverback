import { NotFoundError } from 'tree-house-errors';
import { Code } from '../models/code.model';
import { Filters } from '../models/filters.model';
import { logger } from '../lib/logger';
import * as metaRepository from '../repositories/meta.repository';

/**
 * Return all codes for a specific code type
 */
export async function findAllCodes(codeType: string, filters: Filters): Promise<{ data: Code[], totalCount: number }> {
  try {
    const type = await metaRepository.findCodeTypeByCode(codeType);
    if (!type) throw new NotFoundError();

    return metaRepository.findAllCodes(type.id, filters);
  } catch (error) {
    logger.error(`An error occured in the meta service: ${error}`);
    throw error;
  }
}
