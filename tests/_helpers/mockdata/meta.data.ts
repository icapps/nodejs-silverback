import { Code } from '../../../src/models/code.model';
import { CodeType } from '../../../src/models/code-type.model';
import { tableNames } from '../../../src/constants';
import { db } from '../../../src/lib/db';
import * as metaRepository from '../../../src/repositories/meta.repository';

export async function createCodeType({ code, description }) {
  return metaRepository.createCodeType({
    code,
    description,
  });
}

export async function createCode({ codeType, value }) {
  const code: Code = { value };
  return metaRepository.createCode(code, codeType);
}

export function clearCodeTypesData() {
  return db(tableNames.CODETYPES).del();
}

export function clearCodesData() {
  return db(tableNames.CODES).del();
}
