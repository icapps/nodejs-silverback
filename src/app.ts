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

// Error handling
app.use((error, _req, res, _next) => responder.error(res, error));
app.all('*', (_req, res) => res.sendStatus(404));

export default app;

