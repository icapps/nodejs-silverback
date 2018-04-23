import { tableNames } from '../../../src/constants';
import { db } from '../../../src/lib/db';
import { clearMemoryStore } from './memory-store.data';

/**
 * Clear all databases
 */
export function clearAll() {
  return Promise.all([
    clearMemoryStore(),
    db(tableNames.USERS).del(),
    db(tableNames.CODES).del(),
    db(tableNames.CODETYPES).del(),
  ]);
}
