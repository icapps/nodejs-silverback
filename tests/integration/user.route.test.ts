import * as request from 'supertest';
import * as httpStatus from 'http-status';
import * as Joi from 'joi';
import * as faker from 'faker';
import * as _ from 'lodash';
import { app } from '../../src/app';
import { clearAll } from '../_helpers/mockdata/data';
import { validUsers, validUser, adminUser, regularUser, createUsers, clearUserData, createUser, findById } from '../_helpers/mockdata/user.data';
import { usersSchema, userSchema, createUserSchema, userByIdSchema } from '../_helpers/payload-schemes/user.schema';
import { rolesSchema } from '../_helpers/payload-schemes/role.schema';
import { getValidJwt, getAdminToken, getUserToken } from '../_helpers/mockdata/auth.data';
import { roles } from '../../src/config/roles.config';
import { errors } from '../../src/config/errors.config';
import * as mailer from '../../src/lib/mailer';

describe('/users', () => {
  const prefix = `/api/${process.env.API_VERSION}`;
  let userToken;
  let adminToken;

  beforeAll(async () => {
    await clearAll(); // Full db clear
    userToken = await getUserToken(); // Also creates user
    adminToken = await getAdminToken(); // Also creates user
  });

  afterAll(async () => {
    await clearAll(); // Full db clear - empty db after tests
    jest.clearAllMocks();
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

    it('Should throw an error when user has no admin rights', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.NO_PERMISSION.code);
      expect(body.errors[0].title).toEqual(errors.NO_PERMISSION.message);
    });
  });

  describe('GET /:userId', () => {
    let user;

    beforeAll(async () => {
      user = await createUser(validUser);
    });

    afterAll(async () => {
      await clearUserData(); // Clear user db (except users for tokens)
    });

    it('Should succesfully return user via id', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toMatchObject({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        hasAccess: user.hasAccess,
        role: user.role,
      });
      Joi.validate(body, userByIdSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should throw an error when user id is not a valid guid', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users/unknownId`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw an error when user does not exist', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users/${faker.random.uuid()}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error when user has no admin rights', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.NO_PERMISSION.code);
      expect(body.errors[0].title).toEqual(errors.NO_PERMISSION.message);
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

    it('Should succesfully create a new user who has to change his password', async () => {
      const mailSpy = jest.spyOn(mailer, 'sendTemplate').mockImplementation(() => Promise.resolve());

      const { body, status } = await request(app)
        .post(`${prefix}/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query('changePassword=true')
        .send({
          email: 'test@changePw.com',
          firstName: 'Test',
          lastName: 'Unknown',
          password: 'prutser123',
          hasAccess: false,
          role: roles.ADMIN.code,
        });

      expect(status).toEqual(httpStatus.CREATED);
      expect(body.data.email).toEqual('test@changePw.com');
      Joi.validate(body, createUserSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });

      const createdUser = await findById(body.data.id);
      expect(createdUser.resetPwToken).toEqual(expect.any(String));
    });

    it('Should throw an error when trying to create a duplicate user', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          password: 'prutser123',
          hasAccess: false,
          role: roles.ADMIN.code,
        });
      expect(status).toEqual(httpStatus.CREATED);

      const { body: body2, status: status2 } = await request(app)
        .post(`${prefix}/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          password: 'prutser123',
          hasAccess: false,
          role: roles.ADMIN.code,
        });
      expect(status2).toEqual(httpStatus.BAD_REQUEST);
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
      expect(body.errors[0].code).toEqual(errors.NO_PERMISSION.code);
      expect(body.errors[0].title).toEqual(errors.NO_PERMISSION.message);
    });
  });

  describe('PUT /:userId', () => {
    let user;

    beforeAll(async () => {
      user = await createUser(validUser);
    });

    afterAll(async () => {
      await clearUserData(); // Clear user db (except users for tokens)
    });

    it('Should succesfully update an existing user', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          hasAccess: false,
          role: roles.ADMIN.code,
        });

      expect(status).toEqual(httpStatus.OK);
      expect(body.data.email).toEqual('test@unknown2.com');
      Joi.validate(body, createUserSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });

      const updated = await findById(user.id);
      expect(updated).toMatchObject({
        id: expect.any(String),
        email: 'test@unknown2.com',
        firstName: 'Test',
        lastName: 'Unknown',
        password: expect.any(String),
        hasAccess: false,
        role: roles.ADMIN.code,
      });
    });

    it('Should throw an error when user id is not a valid guid', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/users/unknownId`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          hasAccess: false,
          role: roles.ADMIN.code,
        });
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw an error when user does not exist', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/users/${faker.random.uuid()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          hasAccess: false,
          role: roles.ADMIN.code,
        });
      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error when not all fields are provided', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body.errors[0].code).toEqual(errors.INVALID_INPUT.code);
      expect(body.errors[0].title).toEqual(errors.INVALID_INPUT.message);
    });

    it('Should throw an error when user has no admin rights', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          hasAccess: false,
          role: roles.ADMIN.code,
        });

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.NO_PERMISSION.code);
      expect(body.errors[0].title).toEqual(errors.NO_PERMISSION.message);
    });
  });

  describe('PATCH /:userId', () => {
    let user;

    beforeAll(async () => {
      user = await createUser(validUser);
    });

    afterAll(async () => {
      await clearUserData(); // Clear user db (except users for tokens)
    });

    it('Should succesfully update the property of an existing user', async () => {
      const { body, status } = await request(app)
        .patch(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'test@unknown2.com',
        });

      expect(status).toEqual(httpStatus.OK);
      expect(body.data.email).toEqual('test@unknown2.com');
      Joi.validate(body, createUserSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });

      const updated = await findById(user.id);
      expect(updated).toMatchObject({
        id: expect.any(String),
        email: 'test@unknown2.com',
        firstName: user.firstName,
        lastName: user.lastName,
        password: expect.any(String),
        hasAccess: user.hasAccess,
        role: user.role,
      });
    });

    it('Should throw an error when an invalid property is provided', async () => {
      const { body, status } = await request(app)
        .patch(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          unknownStuff: 'test@unknown2.com',
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body.errors[0].code).toEqual(errors.INVALID_INPUT.code);
      expect(body.errors[0].title).toEqual(errors.INVALID_INPUT.message);
    });

    it('Should throw an error when user id is not a valid guid', async () => {
      const { body, status } = await request(app)
        .patch(`${prefix}/users/unknownId`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'test@unknown2.com',
        });
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw an error when user does not exist', async () => {
      const { body, status } = await request(app)
        .patch(`${prefix}/users/${faker.random.uuid()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'test@unknown2.com',
        });
      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error when user has no admin rights', async () => {
      const { body, status } = await request(app)
        .patch(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'test@unknown2.com',
        });

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.NO_PERMISSION.code);
      expect(body.errors[0].title).toEqual(errors.NO_PERMISSION.message);
    });
  });

  describe('DELETE /:userId', () => {
    let user;

    beforeAll(async () => {
      user = await createUser(validUser);
    });

    afterAll(async () => {
      await clearUserData(); // Clear user db (except users for tokens)
    });

    it('Should succesfully delete an existing user', async () => {
      const { body, status } = await request(app)
        .delete(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toEqual(httpStatus.NO_CONTENT);
      expect(body).toEqual({});

      const removed = await findById(user.id);
      expect(removed).toBeUndefined();
    });

    it('Should throw an error when user does not exist', async () => {
      const { body, status } = await request(app)
        .delete(`${prefix}/users/${faker.random.uuid()}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error when user id is not a valid guid', async () => {
      const { body, status } = await request(app)
        .delete(`${prefix}/users/unknownId`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw an error when user has no admin rights', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          hasAccess: false,
          role: roles.ADMIN.code,
        });

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.NO_PERMISSION.code);
      expect(body.errors[0].title).toEqual(errors.NO_PERMISSION.message);
    });
  });

  describe('GET /roles', () => {
    const numberOfRoles = Object.keys(roles).length;

    it('Should succesfully return all roles', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users/roles`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(numberOfRoles);
      expect(body.meta).toMatchObject({
        type: 'roles',
        count: numberOfRoles,
        totalCount: numberOfRoles,
      });

      Joi.validate(body, rolesSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should return error when user does not have admin rights', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/users/roles`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.UNAUTHORIZED.code);
      expect(body.errors[0].title).toEqual(errors.UNAUTHORIZED.message);
    });
  });
});

