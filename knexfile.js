const dotenvSafe = require('dotenv');
dotenvSafe.config(); // No dotenv-safe otherwise tests will fail due to settings at runtime
const toCamelCase = require('camelcase-keys');
const _ = require('lodash');

const nestFlatlist = flatList => {
  const nestedObject = {};
  _.forEach(flatList, (value, key) => _.set(nestedObject, key, value));
  return nestedObject;
}

function snakeCase(str) {
  return str.replace(/([A-Z])/g, $1 => "_" + $1.toLowerCase());
}

const defaultConfig = {
  client: 'pg',
  pool: {
    min: 0,
    max: 5,
  },
  connection: process.env.DATABASE_URL,
  useNullAsDefault: true,
  debug: process.env.DB_LOG_LEVEL === 'debug' ? true : false,
  migrations: {
    directory: `${__dirname}/db/migrations`,
  },
  seeds: {
    directory: `${__dirname}/db/seeds`,
  },

  // camelCase keys response from query
  postProcessResponse: (result, queryContext) => {
    if (!result || typeof (result) === 'number' || typeof result === 'string') return result;
    if (Array.isArray(result)) return result.map(row => toCamelCase(nestFlatlist(row)));
    return toCamelCase(nestFlatlist(result));
  },

  // snake_case keys in query
  wrapIdentifier: (value, origImpl, queryContext) => {
    if (value === '*' || value === 'COUNT(*) OVER()') return value;
    return origImpl(snakeCase(value));
  },
};


// Split into environments if we ever wish to tweak settings per environment
module.exports = {
  test: Object.assign({}, defaultConfig, {
    connection: 'postgres://developer:developer@localhost:5432/silverback_test', // Static test DB
  }),
  staging: Object.assign({}, defaultConfig),
  development: Object.assign({}, defaultConfig),
  production: Object.assign({}, defaultConfig),
};
