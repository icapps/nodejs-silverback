import * as request from 'supertest';
import * as httpStatus from 'http-status';
import * as Joi from 'joi';
import * as faker from 'faker';
import * as _ from 'lodash';
import { app } from '../../src/app';
import { validUsers, createUsers, resetUserData } from '../_helpers/mockdata/user.data';
import { usersSchema } from '../_helpers/payload-schemes/user.schema';
import { getValidJwt } from '../_helpers/mockdata/auth.data';

describe('/users', () => {
  describe('GET /', () => {
    const prefix = `/api/${process.env.API_VERSION}`;
    let users;
    let token;

    beforeAll(async () => {
      users = await createUsers(validUsers); // Creates 3 valid users
      token = await getValidJwt(users.data[0].id);
    });

    afterAll(async () => {
      await resetUserData();
    });

    it('Should return all users with default pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${token}`);

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(3);
      expect(body.meta).toMatchObject({
        type: 'users',
        count: 3,
        totalCount: 3,
      });

      Joi.validate(body, usersSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should return all users within provided pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${token}`)
        .query('limit=1')
        .query('offset=2');

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(1);
      expect(body.meta).toMatchObject({
        type: 'users',
        count: 1,
        totalCount: 3,
      });
    });

    it('Should return users in ascending order for email', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${token}`)
        .query('sortField=email')
        .query('sortOrder=asc');

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(3);
      expect(body.meta).toMatchObject({
        type: 'users',
        count: 3,
        totalCount: 3,
      });

      const sorted = _.sortBy(validUsers, 'email');
      body.data.forEach((user, index) => {
        expect(user.email).toEqual(sorted[index].email);
      });
    });

    it('Should return users in descending order for email', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${token}`)
        .query('sortField=email')
        .query('sortOrder=desc');

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(3);
      expect(body.meta).toMatchObject({
        type: 'users',
        count: 3,
        totalCount: 3,
      });

      const sorted = _.sortBy(validUsers, 'email').reverse();
      body.data.forEach((user, index) => {
        expect(user.email).toEqual(sorted[index].email);
      });
    });

    it('Should return all users when invalid sorting field is provided', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${token}`)
        .query('sortField=invalidField')
        .query('sortOrder=desc');

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(3);
      expect(body.meta).toMatchObject({
        type: 'users',
        count: 3,
        totalCount: 3,
      });

      body.data.forEach((user, index) => {
        expect(user.email).toEqual(validUsers[index].email);
      });
    });

    it('Should return all users matching `willem` in email', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${token}`)
        .query('search=willem');

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(1);
      expect(body.meta).toMatchObject({
        type: 'users',
        count: 1,
        totalCount: 1,
      });

      const found = validUsers.find(x => x.email === 'willem.wortel@icapps.com');
      expect(body.data[0].email).toEqual(found.email);
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
