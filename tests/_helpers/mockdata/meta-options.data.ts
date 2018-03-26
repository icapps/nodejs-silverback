import { Code } from '../../../src/models/code.model';
import { CodeType } from '../../../src/models/code-type.model';
import { tableNames } from '../../../src/constants';
import { db } from '../../../src/lib/db';
import * as metaOptionsRepository from '../../../src/repositories/meta-options.repository';

export const mockMetaOptions: Code = {
  code: 'LANGUAGE',
};

export const mockCodeTypes: CodeType[] = [
  {
    value: 'EN',
  },
  {
    value: 'NL',
  },
  {
    value: 'FR',
  },
];

export async function createMetaOptions(code: Code, codeTypes: CodeType[]) {
  const codeValue = await metaOptionsRepository.createCode(code);
  for (const codeType of codeTypes) {
    await metaOptionsRepository.createCodeType(codeValue[0], codeType);
  }
  return await metaOptionsRepository.getAll();
}

export function resetMetaOptionsData() {
  return db(tableNames.CODETYPES).del()
    .then(() => db(tableNames.CODES).del());
}
