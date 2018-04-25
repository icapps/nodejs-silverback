import * as knex from 'knex';
import { envs } from '../constants';
const dbConfig = require('../../knexfile.js');

export const db = knex(dbConfig[process.env.NODE_ENV || envs.DEVELOP]);


/**
 * Select values and count total
 */
export function selectAndCount(db: knex, values: string[]) {
  return db.select(db.raw(`${values.map(x => `"${x}"`).join(',')}, count(*) OVER() AS total`));
}


/**
 * Return the total count of an array with data object
 * selectAndCount will provide a total property on every item in the array (let's take the first one)
 */
export function parseTotalCount(data: any[]): number {
  if (data.length === 0) return 0;
  return parseInt(data[0].total, 10);
}
