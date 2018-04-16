import { NotFoundError } from 'tree-house-errors';
import { Code, CodeCreate } from '../models/code.model';
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


/**
 * Create a new code for a specific code type
 */
export async function createCode(codeType: string, values: CodeCreate) {
  try {
    const type = await metaRepository.findCodeTypeByCode(codeType);
    if (!type) throw new NotFoundError();

    return metaRepository.createCode(type.id, values);
  } catch (error) {
    logger.error(`An error occured in the meta service: ${error}`);
    throw error;
  }
}


/**
 * Deprecate a code
 */
export async function deprecateCode(codeId: string) {
  try {
    const result = await metaRepository.updateCode(codeId, { deprecated: true });
    if (!result) throw new NotFoundError();
    return result;
  } catch (error) {
    logger.error(`An error occured deprecating a code: ${error}`);
    throw error;
  }
}
