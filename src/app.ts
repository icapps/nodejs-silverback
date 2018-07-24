import * as express from 'express';
import * as treehouse from 'tree-house';
import { getSession } from 'tree-house-authentication';
import { responder } from './lib/responder';
import { envs } from './constants';
import { sessionConfig } from './config/auth.config';
import * as appConfig from './config/app.config';

// Create express instance
const app: express.Application = express();

console.log('Allowed cors', (process.env.ALLOWED_CORS_DOMAINS || '*').split(','));

treehouse.setBodyParser(app, '*');
treehouse.setBasicSecurity(app, '*', {
  cors: {
    origin: (process.env.ALLOWED_CORS_DOMAINS || '*').split(','),
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
    allowedHeaders: ['Cache-Control', 'Pragma', 'Origin', 'Authorization', 'Content-Type', 'X-Requested-With', 'Set-Cookie'],
    credentials: true,
  },
});

app.set('trust proxy', 1); // Heroku proxy stuff
app.get('/', (_req, res) => res.json(appConfig.VERSIONS)); // Display all versions

// Session authentication
app.use(getSession(sessionConfig));

// Load routes (versioned routes go in the routes/ directory)
for (const x in appConfig.VERSIONS) {
  app.use(`/api${appConfig.VERSIONS[x]}`, require(`./routes/${appConfig.VERSIONS[x]}`).routes);

  // Set swagger per version
  if (process.env.NODE_ENV !== envs.PRODUCTION) {
    treehouse.setSwagger(app, `/api${appConfig.VERSIONS[x]}/documentation`, `docs/${appConfig.VERSIONS[x]}.yml`, {
      host: process.env.SWAGGER_BASE_URL,
      schemes: ['http', 'https'],
    });
  }
}

// Error handling
app.use((error, req, res, _next) => responder.error(req, res, error));
app.all('*', (_req, res) => res.sendStatus(404));

export { app };
