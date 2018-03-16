import './config/load-env'; // Load our environment variables

import * as treehouse from 'tree-house';
import app from './app';

treehouse.startServer(app, {
  title: 'Silverback',
  port: parseInt(process.env.PORT, 10),
});
