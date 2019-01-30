import './config/load-env'; // Load our environment variables

import * as treehouse from 'tree-house';
import { logger, sentry } from './lib/logger';
import { importTranslations } from './lib/translator';
import { app } from './app';
import { errorTranslations } from './constants';

sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

process.on('unhandledRejection', (e) => {
  logger.error(`unhandledRejection: ${e.message}`);
  sentry.captureException(e); // Send to Sentry
});

process.on('uncaughtException', (e) => {
  logger.error(`uncaughtException: ${e.stack}`);
  sentry.captureException(e); // Send to Sentry
});

treehouse.startServer(app, {
  title: 'Silverback',
  port: parseInt(process.env.PORT || '3000', 10),
  pre: () => importTranslations(process.env.TRANSLATION_API_URL, process.env.TRANSLATION_API_TOKEN, { destination: errorTranslations }),
});
