import './config/load-env'; // Load our environment variables

import * as treehouse from 'tree-house';
import { logger, raven } from './lib/logger';
import { importTranslations } from './lib/translator';
import { app } from './app';
import { errorTranslations } from './constants';

raven.config(process.env.SENTRY_DSN, {
  environment: process.env.NODE_ENV,
}).install();

process.on('unhandledRejection', (e) => {
  logger.error(`unhandledRejection: ${e.message}`);
  raven.captureException(e); // Send to Raven
});

treehouse.startServer(app, {
  title: 'Silverback',
  port: parseInt(process.env.PORT || '3000', 10),
  pre: () => importTranslations(process.env.TRANSLATION_API_URL, process.env.TRANSLATION_API_TOKEN, { destination: errorTranslations }),
});
