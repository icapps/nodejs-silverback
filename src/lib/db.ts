import * as knex from 'knex';
const dbConfig = require('../../knexfile.js');

export const db = knex(dbConfig[process.env.NODE_ENV]);

/**
 * Select values and count total
 */
export function selectAndCount(db: knex, values: string[]) {
  return db.select([...values, 'COUNT(*) OVER() AS total']);
}

/**
 * Return the total count of an array with data object
 * selectAndCount will provide a total property on every item in the array (let's take the first one)
 */
export function parseTotalCount(data: any[]): number {
  if (data.length === 0) return 0;
  return parseInt(data[0].total, 10);
}

/**
 * Execute an update/create query and return the updated/created values
 */
export async function execAndFind(query: knex.QueryBuilder, identifier: string, findByIdFn: Function, ...args): Promise<any> {
  const result = (await query)[0];
  return result ? findByIdFn(result[identifier], ...args) : undefined;
}
