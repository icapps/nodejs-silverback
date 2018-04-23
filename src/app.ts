import * as express from 'express';
import * as treehouse from 'tree-house';
import * as appConfig from './config/app.config';
import { responder } from './lib/responder';

// Create express instance
const app: express.Application = express();

// Basic security setup
treehouse.setBasicSecurity(app, '*', {
  cors: {
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
    allowedHeaders: ['Cache-Control', 'Pragma', 'Origin', 'Authorization', 'Content-Type', 'X-Requested-With'],
  },
});

treehouse.setBodyParser(app, '*');
// treehouse.setRateLimiter(app, '*'); // TODO: Fix proper settings

// Display all versions
app.get('/', (_req, res) => res.json(appConfig.VERSIONS));

// Load routes (versioned routes go in the routes/ directory)
for (const x in appConfig.VERSIONS) {
  app.use(`/api${appConfig.VERSIONS[x]}`, require(`./routes/${appConfig.VERSIONS[x]}`).routes);

  // Set swagger per version
  if (process.env.NODE_ENV !== 'production') {
    treehouse.setSwagger(app, `/api${appConfig.VERSIONS[x]}/documentation`, `docs/${appConfig.VERSIONS[x]}.yml`, {
      host: process.env.SWAGGER_BASE_URL,
      schemes: ['http', 'https'],
    });
  }
}

// Error handling
app.use((error, _req, res, _next) => responder.error(res, error));
app.all('*', (_req, res) => res.sendStatus(404));

export { app };

