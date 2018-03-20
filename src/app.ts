import * as express from 'express';
import * as treehouse from 'tree-house';
import { responder } from './lib/responder';
import * as appConfig from './config/app.config';

// Create express instance
const app: express.Application = express();

// Basic security setup
treehouse.setLocalHeaders(app, '*');
treehouse.setBasicSecurity(app, '*');
treehouse.setBodyParser(app, '*');
treehouse.setRateLimiter(app, '*');

// Display all versions
app.get('/', (_req, res) => res.json(appConfig.VERSIONS));

// Load routes (versioned routes go in the routes/ directory)
for (const x in appConfig.VERSIONS) {
  app.use(`/api${appConfig.VERSIONS[x]}`, require('./routes' + appConfig.VERSIONS[x]).routes);

  // Set swagger per version
  treehouse.setSwagger(app, `/api${appConfig.VERSIONS[x]}/documentation`, `docs/${appConfig.VERSIONS[x]}.yml`, {
    host: process.env.SWAGGER_BASE_URL,
    schemes: ['http', 'https'],
  });
}

// Error handling
app.use((error, _req, res, _next) => responder.error(res, error));
app.all('*', (_req, res) => res.sendStatus(404));

export { app };

