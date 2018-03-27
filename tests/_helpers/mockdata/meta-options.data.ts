import { Code } from '../../../src/models/code.model';
import { CodeType } from '../../../src/models/code-type.model';
import { tableNames } from '../../../src/constants';
import { db } from '../../../src/lib/db';
import * as metaOptionsRepository from '../../../src/repositories/meta-options.repository';

export async function createCodeType({ code, description }) {
  return metaOptionsRepository.createCodeType({
    code,
    description,
  });
}

export async function createCodes({ codeType, value }) {
  const code: Code = { value };
  return metaOptionsRepository.createCode(code, codeType);
}

export function clearCodeTypesData() {
  return db(tableNames.CODETYPES).del();
}

export function clearCodesData() {
  return db(tableNames.CODES).del();
}
