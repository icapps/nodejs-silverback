import { envs, errorTranslations } from '../src/constants';
import { existsSync, mkdirSync } from 'fs';

export const environment = {
  NODE_ENV: envs.TEST,
  LOG_LEVEL: 'info',
  DATABASE_URL: 'postgres://developer:developer@localhost:5432/silverback_test',
  API_VERSION: 'v1',
  FORGOT_PW_LINK: 'https://test.com/forgot-pw',
  SYSTEM_EMAIL: 'info@icapps.com',
  HEROKU_RELEASE_VERSION: 'v1',
  MIN_VERSION_ANDROID: '1.0.0',
  LATEST_VERSION_ANDROID: '2.0.1',
  MIN_VERSION_IOS: '1.0.0',
  LATEST_VERSION_IOS: '2.0.2',
  MANDRILL_API_KEY: 'myKey',
  REDISCLOUD_URL: 'redis://0.0.0.0:6379',
};

Object.keys(environment).forEach((key) => {
  process.env[key] = environment[key];
});


// Must be after env variables
import { logger } from '../src/lib/logger';

// Locales folder
if (!existsSync(errorTranslations)) {
  mkdirSync(errorTranslations);
}

// Overwrite warn/error console.logs
logger.error = jest.fn(() => {});
