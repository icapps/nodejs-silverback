import * as request from 'supertest';
import * as httpStatus from 'http-status';
import * as Joi from 'joi';
import * as faker from 'faker';
import * as _ from 'lodash';
import { app } from '../../src/app';
import { clearAll } from '../_helpers/mockdata/data';
import { validUsers, adminUser, regularUser, createUsers, clearUserData, createUser } from '../_helpers/mockdata/user.data';
import { usersSchema, userSchema, createUserSchema } from '../_helpers/payload-schemes/user.schema';
import { getValidJwt, getAdminToken, getUserToken } from '../_helpers/mockdata/auth.data';
import { roles } from '../../src/config/roles.config';
import { errors } from '../../src/config/errors.config';

describe('/users', () => {
  const prefix = `/api/${process.env.API_VERSION}`;
  let userToken;
  let adminToken;

  beforeAll(async () => {
    await clearAll(); // Full db clear
    userToken = await getUserToken(); // Also creates user
    adminToken = await getAdminToken(); // Also creates user
  });

  describe('GET /', () => {
    let users;

    beforeAll(async () => {
      await createUsers(validUsers); // Creates 3 valid users
      users = [regularUser, adminUser, ...validUsers];
    });

    afterAll(async () => {
      await clearUserData(); // Clear user db (except users for tokens)
    });

    it('Should return all users with default pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(5);
      expect(body.meta).toMatchObject({
        type: 'users',
        count: 5,
        totalCount: 5,
      });

      Joi.validate(body, usersSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should return all users within provided pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query('limit=1')
        .query('offset=2');

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(1);
      expect(body.meta).toMatchObject({
        type: 'users',
        count: 1,
        totalCount: 5,
      });
    });

    it('Should return users in ascending order for email', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query('sortField=email')
        .query('sortOrder=asc');

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(5);
      expect(body.meta).toMatchObject({
        type: 'users',
        count: 5,
        totalCount: 5,
      });

      const sorted = _.sortBy(users, 'email');
      body.data.forEach((user, index) => {
        expect(user.email).toEqual(sorted[index].email);
      });
    });

    it('Should return users in descending order for email', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query('sortField=email')
        .query('sortOrder=desc');

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(5);
      expect(body.meta).toMatchObject({
        type: 'users',
        count: 5,
        totalCount: 5,
      });

      const sorted = _.sortBy(users, 'email').reverse();
      body.data.forEach((user, index) => {
        expect(user.email).toEqual(sorted[index].email);
      });
    });

    it('Should return all users when invalid sorting field is provided', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query('sortField=invalidField')
        .query('sortOrder=desc');

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(5);
      expect(body.meta).toMatchObject({
        type: 'users',
        count: 5,
        totalCount: 5,
      });

      body.data.forEach((user, index) => {
        expect(user.email).toEqual(users[index].email);
      });
    });

    it('Should return all users matching `willem` in email', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query('search=willem');

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(1);
      expect(body.meta).toMatchObject({
        type: 'users',
        count: 1,
        totalCount: 1,
      });

      const found = users.find(x => x.email === 'willem.wortel@icapps.com');
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
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it('Should throw an error without jwt token provided', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`);
      expect(status).toEqual(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /', () => {
    afterAll(async () => {
      await clearUserData(); // Clear user db (except users for tokens)
    });

    it('Should succesfully create a new user', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'test@unknown.com',
          firstName: 'Test',
          lastName: 'Unknown',
          password: 'prutser123',
          hasAccess: false,
          role: roles.ADMIN.code,
        });

      expect(status).toEqual(httpStatus.CREATED);
      expect(body.data.email).toEqual('test@unknown.com');
      Joi.validate(body, createUserSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should throw a validation error when not all fields are provided', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'test@unknown.com',
          firstName: 'Test',
          lastName: 'Unknown',
          password: 'prutser123',
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body.errors[0].code).toEqual(errors.INVALID_INPUT.code);
      expect(body.errors[0].title).toEqual(errors.INVALID_INPUT.message);
    });

    it('Should throw an error when user has no admin rights', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/users`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'test@unknown.com',
          firstName: 'Test',
          lastName: 'Unknown',
          password: 'prutser123',
          hasAccess: false,
          role: roles.ADMIN.code,
        });

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.UNAUTHORIZED.code);
      expect(body.errors[0].title).toEqual(errors.UNAUTHORIZED.message);
    });

    it('Should throw an error when no jwt token is provided', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/users`)
        .send({
          email: 'test@unknown.com',
          firstName: 'Test',
          lastName: 'Unknown',
          password: 'prutser123',
          hasAccess: false,
          role: roles.ADMIN.code,
        });

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.UNAUTHORIZED.code);
      expect(body.errors[0].title).toEqual(errors.UNAUTHORIZED.message);
    });
  });
});
