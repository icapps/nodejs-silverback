import { NotFoundError, BadRequestError } from 'tree-house-errors';
import { Code, CodeCreate, PartialCodeUpdate } from '../models/code.model';
import { Filters } from '../models/filters.model';
import { logger } from '../lib/logger';
import { errors } from '../config/errors.config';
import * as metaRepository from '../repositories/meta.repository';


/**
 * Return a code by id
 */
export async function findById(codeId: string): Promise<Code> {
  const result = await metaRepository.findById(codeId);
  if (!result) throw new NotFoundError();
  return result;
}


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
export async function createCode(codeType: string, values: CodeCreate): Promise<Code> {
  try {
    const type = await metaRepository.findCodeTypeByCode(codeType);
    if (!type) throw new NotFoundError();

    const isUniqueCode = await metaRepository.isUniqueCode(values.code, type.id);
    if (!isUniqueCode) throw new BadRequestError(errors.CODE_DUPLICATE);

    return metaRepository.createCode(type.id, values);
  } catch (error) {
    logger.error(`An error occured in the meta service: ${error}`);
    throw error;
  }
}


/**
 * Update existing properties of a code
 */
export async function partialCodeUpdate(codeId: string, values: PartialCodeUpdate): Promise<Code> {
  try {
    const result = await metaRepository.updateCode(codeId, values);
    if (!result) throw new NotFoundError();
    return result;
  } catch (error) {
    logger.error(`An error occured updating a code: ${error}`);
    throw error;
  }
}
