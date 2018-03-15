import * as express from 'express';
import { responder } from './lib/responder';

// Create express instance
const app: express.Application = express();

// Error handling
app.use((error, _req, res, _next) => responder.error(res, error));
app.all('*', (_req, res) => res.sendStatus(404));

export default app;

