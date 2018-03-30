import './config/load-env'; // Load our environment variables

import * as treehouse from 'tree-house';
import { logger } from './lib/logger';
import { app } from './app';

treehouse.startServer(app, {
  title: 'Silverback',
  port: parseInt(process.env.PORT || '3000', 10),
});

process.on('unhandledRejection', (e) => {
  logger.error(`unhandledRejection: ${e.message}`);
});

