import { db, parseTotalCount, selectAndCount } from '../lib/db';
import { logger } from '../lib/logger';
import { tableNames, defaultFilters } from '../constants';
import { Code, CodeFilters } from '../models/code.model';
import { CodeType } from '../models/code-type.model';
import { Filters } from '../models/filters.model';
import { applyPagination } from '../lib/filter';

const defaultCodeReturnValues = ['id', 'value', 'codeId'];
const defaultCodeTypeReturnValues = ['id', 'code', 'description'];

/**
 * Create a new codeType
 */
export async function createCodeType(values: CodeType): Promise<CodeType> {
  const query = db.insert(values, defaultCodeTypeReturnValues)
    .into(tableNames.CODETYPES);

  logger.debug(`Create new codeType: ${query.toString()}`);
  return (await query)[0];
}

/**
 * Create a new code
 */
export async function createCode(values: Code, codeType: CodeType): Promise<Code> {
  const allValues = Object.assign({}, values, { codeId: codeType.id });
  const query = db.insert(allValues, defaultCodeReturnValues)
    .into(tableNames.CODES);

  logger.debug(`Create new code: ${query.toString()}`);
  return (await query)[0];
}

/**
 * Return all codeTypes
 */
export async function findAllCodeTypes(options: Filters = {}): Promise<{ data: CodeType[], totalCount: number }> {
  const allOptions = Object.assign({}, defaultFilters, options);

  const query = selectAndCount(db, defaultCodeTypeReturnValues)
    .from(tableNames.CODETYPES);

  applyPagination(query, allOptions);
  logger.warn(`Get all codeTypes: ${query.toString()}`);

  const data = await query;
  return { data, totalCount: parseTotalCount(data) };
}

/**
 * Return all codes
 */
export async function findAllCodes(options: CodeFilters): Promise<{ data: Code[], totalCount: number }> {
  const allOptions = Object.assign({}, defaultFilters, options);

  let query;
  if (allOptions.codeId) {
    query = selectAndCount(db, defaultCodeReturnValues)
      .from(tableNames.CODES).where('codeId', allOptions.codeId);
  } else {
    query = selectAndCount(db, defaultCodeReturnValues)
      .from(tableNames.CODES);
  }

  applyPagination(query, allOptions);
  logger.debug(`Get all codes: ${query.toString()}`);

  const data = await query;
  return { data, totalCount: parseTotalCount(data) };
}
