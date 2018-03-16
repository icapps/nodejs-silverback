import * as express from 'express';
import * as treehouse from 'tree-house';
import { responder } from './lib/responder';

// Create express instance
const app: express.Application = express();

// Basic security setup
treehouse.setLocalHeaders(app, '*');
treehouse.setBasicSecurity(app, '*');
treehouse.setBodyParser(app, '*');
treehouse.setRateLimiter(app, '*');

// TODO: Versioning (loop over folder from docs and set route per version)
treehouse.setSwagger(app, '/documentation/v1', 'docs/v1.0.0.yml', {
  host: process.env.SWAGGER_BASE_URL,
  schemes: ['http', 'https'],
});

// Error handling
app.use((error, _req, res, _next) => responder.error(res, error));
app.all('*', (_req, res) => res.sendStatus(404));

export default app;

