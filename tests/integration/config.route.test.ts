import * as request from 'supertest';
import * as Joi from 'joi';
import * as httpStatus from 'http-status';

import { app } from '../../src/app';
import { environment } from '../test.config';

describe('/', () => {
  const prefix = `/api/${process.env.API_VERSION}`;

  describe('GET /version', () => {
    it('Should successfully return api version', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/version`);

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toEqual({
        build: environment.HEROKU_RELEASE_VERSION,
        version: '1.0.0', // TODO: Dynamic value from package.json
      });
    });
  });

  describe('GET /version/:os', () => {
    it('Should successfully return android version', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/version/android`);

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toEqual({
        minVersion: environment.MIN_VERSION_ANDROID,
        latestVersion: environment.LATEST_VERSION_ANDROID,
      });
    });

    it('Should successfully return ios version', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/version/ios`);

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toEqual({
        minVersion: environment.MIN_VERSION_IOS,
        latestVersion: environment.LATEST_VERSION_IOS,
      });
    });


    it('Should throw an error when an invalid os is provided', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/version/unknown`);
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });
  });
});
