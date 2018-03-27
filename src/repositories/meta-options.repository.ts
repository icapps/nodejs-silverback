import { db, parseTotalCount } from '../lib/db';
import { logger } from '../lib/logger';
import { tableNames, defaultFilters } from '../constants';
import { Code } from '../models/code.model';
import { CodeType } from '../models/code-type.model';
import { Filters } from '../models/filters.model';
import { applyPagination } from '../lib/filter';

const defaultReturnValues = ['id', 'value', 'codeId'];
const defaultCodeReturnValues = ['id', 'code'];

/**
 * Create new code
 */
export async function createCode(values: Code): Promise<Code> {
  const query = db.insert(values, defaultCodeReturnValues)
    .into(tableNames.CODES);

  logger.debug(`Create new code: ${query.toString()}`);
  return await query;
}

/**
* Create new codeType
*/
export async function createCodeType(code: Code, values: CodeType): Promise<CodeType> {
  const allValues = Object.assign({}, values, { codeId: code.id });
  const query = db.insert(allValues, defaultReturnValues)
    .into(tableNames.CODETYPES);

  logger.debug(`Create new codeType: ${query.toString()}`);
  return await query;
}

/**
 * Return all codeTypes
 */
export async function getAll(options: Filters = {}): Promise<{ data: Code[], totalCount: number }> {
  const allOptions = Object.assign({}, defaultFilters, options);

  const query = db.select(db.raw(`"codeTypes"."id" as id, "code", "value", count(*) OVER() AS total`))
    .from(tableNames.CODES).innerJoin('codeTypes', 'codes.id', 'codeTypes.codeId');

  applyPagination(query, allOptions);
  logger.debug(`Get all metaOptions: ${query.toString()}`);

  const data = await query;
  return { data, totalCount: parseTotalCount(data) };
}

