const dotenvSafe = require('dotenv');
dotenvSafe.config(); // No dotenv-safe otherwise tests will fail due to settings at runtime

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
};


// Split into environments if we ever wish to tweak settings per environment
module.exports = {
  test: Object.assign({}, defaultConfig, {
    connection: 'postgres://developer:developer@localhost:5432/silverback_test', // Static test DB
  }),
  development: Object.assign({}, defaultConfig),
  production: Object.assign({}, defaultConfig),
};
