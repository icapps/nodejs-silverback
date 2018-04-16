import * as dotenv from 'dotenv';
dotenv.config();

import { logger } from '../src/lib/logger';

export const environment = {
  NODE_ENV: 'test',
  LOG_LEVEL: 'error',
  DATABASE_URL: 'postgres://developer:developer@localhost:5432/silverback_test',
  API_VERSION: 'v1',
  FORGOT_PW_LINK: 'https://test.com/forgot-pw',
  SYSTEM_EMAIL: 'info@icapps.com',
  HEROKU_RELEASE_VERSION: 'v1',
  MIN_VERSION_ANDROID: '1.0.0',
  LATEST_VERSION_ANDROID: '2.0.1',
  MIN_VERSION_IOS: '1.0.0',
  LATEST_VERSION_IOS: '2.0.2',
};

Object.keys(environment).forEach((key) => {
  process.env[key] = environment[key];
});

// Overwrite error console.logs
logger.error = jest.fn((error) => { });
