import { CodeCreate } from '../../../src/models/code.model';
import { CodeTypeCreate } from '../../../src/models/code-type.model';
import { tableNames } from '../../../src/constants';
import { db } from '../../../src/lib/db';
import * as metaRepository from '../../../src/repositories/meta.repository';

export async function createCodeType(values: CodeTypeCreate) {
  return metaRepository.createCodeType(values);
}

export async function createCode(codeTypeId: string, values: CodeCreate) {
  return metaRepository.createCode(codeTypeId, values);
}

export function clearCodeTypesData(codeType: string) {
  return db(tableNames.CODETYPES).del().where('code', codeType);
}

export function clearCodesData() {
  return db(tableNames.CODES).del();
}
