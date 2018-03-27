import { tableNames } from '../../../src/constants';
import { db } from '../../../src/lib/db';


/**
 * Clear all databases
 */
export function clearAll() {
  return Promise.all([
    db(tableNames.USERS).del(),
  ]);
}
