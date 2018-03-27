import * as request from 'supertest';
import * as Joi from 'joi';
import * as httpStatus from 'http-status';
import * as faker from 'faker';

import { app } from '../../src/app';
import { validUsers, createUsers, resetUserData } from '../_helpers/mockdata/user.data';
import { mockMetaOptions, mockCodeTypes, createMetaOptions, resetMetaOptionsData } from '../_helpers/mockdata/meta-options.data';
import { getValidJwt } from '../_helpers/mockdata/auth.data';
import { metaOptionsSchema } from '../_helpers/payload-schemes/metaOptions.schema';

describe('/meta', () => {
  describe('GET /', () => {
    const prefix = `/api/${process.env.API_VERSION}`;

    let users;
    let token;
    let metaOptions;

    beforeAll(async () => {
      users = await createUsers(validUsers);
      token = await getValidJwt(users.data[0].id);
      metaOptions = await createMetaOptions(mockMetaOptions, mockCodeTypes);
    });

    afterAll(async () => {
      await resetUserData();
      await resetMetaOptionsData();
    });

    it('Should return all metaOptions with default pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta-options`)
        .set('Authorization', `Bearer ${token}`);

      expect(status).toEqual(httpStatus.OK);
      expect(body.meta).toMatchObject({
        type: 'metaOptions',
        count: 3,
        totalCount: 3,
      });

      Joi.validate(body, metaOptionsSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should return all metaOptions with provided pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta-options`)
        .set('Authorization', `Bearer ${token}`)
        .query('limit=1')
        .query('offset=2');

      expect(status).toEqual(httpStatus.OK);
      expect(body.meta).toMatchObject({
        type: 'metaOptions',
        count: 1,
        totalCount: 3,
      });

      Joi.validate(body, metaOptionsSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should throw an error when userId in jwt is not found', async () => {
      const invalidToken = await getValidJwt(faker.random.uuid());
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error without admin permission', async () => {
      const invalidUserToken = await getValidJwt(users.data[1].id);
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${invalidUserToken}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it('Should throw an error without jwt token provided', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`);
      expect(status).toEqual(httpStatus.UNAUTHORIZED);
    });
  });
});
