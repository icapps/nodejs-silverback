import { db, parseTotalCount, selectAndCount } from '../lib/db';
import { logger } from '../lib/logger';
import { tableNames, defaultFilters } from '../constants';
import { Code, CodeCreate, CodeUpdate, PartialCodeUpdate } from '../models/code.model';
import { CodeType, CodeTypeCreate } from '../models/code-type.model';
import { applyPagination, applySearch, applySorting } from '../lib/filter';
import { Filters } from '../models/filters.model';

const defaultCodeReturnValues = ['id', 'code', 'name', 'description', 'codeTypeId', 'deprecated', 'createdAt', 'updatedAt'];
const defaultCodeTypeReturnValues = ['id', 'code', 'name', 'description', 'createdAt', 'updatedAt'];

/**
 * Create a new codeType
 */
export async function createCodeType(values: CodeTypeCreate): Promise<CodeType> {
  const query = db.insert(values, defaultCodeTypeReturnValues)
    .into(tableNames.CODETYPES);

  logger.debug(`Create new codeType: ${query.toString()}`);
  return (await query)[0];
}


/**
 * Create a new code
 */
export async function createCode(codeTypeId: string, values: CodeCreate): Promise<Code> {
  const allValues = Object.assign({}, values, { codeTypeId });
  const query = db.insert(allValues, defaultCodeReturnValues)
    .into(tableNames.CODES);

  logger.debug(`Create new code: ${query.toString()}`);
  return (await query)[0];
}


/**
 * Update an existing code
 */
export async function updateCode(codeId: string, values: CodeUpdate | PartialCodeUpdate): Promise<Code> {
  const query = db(tableNames.CODES)
    .update(values, defaultCodeReturnValues)
    .where('id', codeId);

  logger.debug(`Update existing code: ${query.toString()}`);
  return (await query)[0];
}


/**
 * Find a code type via its code
 */
export async function findCodeTypeByCode(code: string): Promise<Code> {
  const query = selectAndCount(db, defaultCodeTypeReturnValues)
    .from(tableNames.CODETYPES)
    .where('code', code.toUpperCase())
    .first();

  logger.debug(`Get code type by code: ${query.toString()}`);
  return await query;
}



/**
 * Return whether a code is unique
 */
export async function isUniqueCode(code: string, codeTypeId: string): Promise<boolean> {
  const query = db(tableNames.CODES)
    .select(defaultCodeReturnValues)
    .where('code', code.toUpperCase())
    .andWhere('codeTypeId', codeTypeId)
    .first();

  logger.debug(`Get code by code and codeTypeId: ${query.toString()}`);
  return !(await query); // If no result -> code is unique
}


/**
 * Return all codes for a specific code type
 */
export async function findAllCodes(codeTypeId: string, options: Filters): Promise<{ data: Code[], totalCount: number }> {
  const allOptions = Object.assign({}, defaultFilters, options);

  const query = selectAndCount(db, defaultCodeReturnValues)
    .from(tableNames.CODES)
    .where('codeTypeId', codeTypeId);

  // Hide deprecated codes unless otherwise requested
  if (!allOptions.showDeprecated) {
    query.where('deprecated', false);
  }

  applyPagination(query, allOptions);
  applySearch(query, allOptions, ['id', 'code', 'name']);
  applySorting(query, allOptions, ['code', 'name']);
  logger.debug(`Get all codes: ${query.toString()}`);

  const data = await query;
  return { data, totalCount: parseTotalCount(data) };
}
