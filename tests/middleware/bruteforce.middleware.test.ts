import * as httpStatus from 'http-status';
import * as request from 'supertest';
import * as express from 'express';
import { setBodyParser } from 'tree-house';
import { setUserBruteForce } from '../../src/middleware/bruteforce.middleware';
import { userBruteConfig } from '../../src/config/security.config';
import { errors } from '../../src/config/errors.config';
import { responder } from '../../src/lib/responder';
import { clearMemoryStore } from '../_helpers/mockdata/memory-store.data';

describe('bruteforce middleware', () => {
  let app;

  beforeEach(async () => {
    app = express();
    setBodyParser(app, '*');

    await clearMemoryStore();
  });

  it('Should start blocking requests with the same ip and username after number of retries', async () => {
    app.use('/test', setUserBruteForce, (_req, res) => res.status(httpStatus.OK).send('Welcome'));
    app.use((error, req, res, _next) => responder.error(req, res, error));

    const numberOfCalls = userBruteConfig.freeRetries + 1;

    // Successful calls
    for (const call of Array(numberOfCalls)) {
      const { status } = await request(app)
        .post('/test')
        .send({ username: 'test@icapps.com' });
      expect(status).toEqual(httpStatus.OK);
    }

    // Blocked call
    const { status, body } = await request(app)
      .post('/test')
      .send({ username: 'test@icapps.com' });

    expect(status).toEqual(httpStatus.TOO_MANY_REQUESTS);
    expect(body.errors[0].code).toEqual(errors.TOO_MANY_REQUESTS.code);
    expect(body.errors[0].title).toEqual(errors.TOO_MANY_REQUESTS.message);

    // Allow call with other username
    const { status: status2, body: body2 } = await request(app)
      .post('/test')
      .send({ username: 'test2@icapps.com' });
    expect(status2).toEqual(httpStatus.OK);
  });
});
