import * as knex from 'knex';
const dbConfig = require('../../knexfile.js');

export const db = knex(dbConfig[process.env.NODE_ENV || 'development']);
