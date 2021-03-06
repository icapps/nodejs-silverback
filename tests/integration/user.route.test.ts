import * as faker from 'faker';
import * as httpStatus from 'http-status';
import * as Joi from 'joi';
import * as _ from 'lodash';
import * as request from 'supertest';
import { app } from '../../src/app';
import { errors } from '../../src/config/errors.config';
import { roles } from '../../src/config/roles.config';
import { findRoleByCode } from '../../src/lib/utils';
import { getUserJwtTokens, getValidJwt } from '../_helpers/mockdata/auth.data';
import { clearAll } from '../_helpers/mockdata/data';
import {
  adminUser,
  clearUserData,
  createUser,
  createUsers,
  findById,
  regularUser,
  removeUser,
  validUser,
  validUsers,
} from '../_helpers/mockdata/user.data';
import { rolesSchema } from '../_helpers/payload-schemes/role.schema';
import { createUserSchema, userByIdSchema, usersSchema } from '../_helpers/payload-schemes/user.schema';

describe('/users', () => {
  const prefix = `/api/${process.env.API_VERSION}`;
  const users = { regular: null, admin: null };
  const tokens = { regular: null, admin: null };

  beforeAll(async () => {
    await clearAll(); // Full db clear

    // Create a regular and admin user
    const { data: createdUsers } = await createUsers([regularUser, adminUser], 'active');
    const sorted = createdUsers.sort((a, b) => a.role.code.localeCompare(b.role.code));
    [users.admin, users.regular] = sorted;

    // All user type tokens
    const createdTokens = await getUserJwtTokens([users.regular, users.admin]);
    [tokens.regular, tokens.admin] = createdTokens;
  });

  afterAll(async () => {
    await clearAll(); // Full db clear - empty db after tests
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    let users;

    beforeAll(async () => {
      await createUsers(validUsers, 'active'); // Creates 3 valid users
      users = [regularUser, adminUser, ...validUsers];
    });

    afterAll(async () => {
      await clearUserData(); // Clear user db (except users for tokens)
    });

    it('Should return all users with default pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${tokens.admin}`);

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
        .set('Authorization', `Bearer ${tokens.admin}`)
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
        .set('Authorization', `Bearer ${tokens.admin}`)
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
        .set('Authorization', `Bearer ${tokens.admin}`)
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

    it('Should return users in descending order for status', async () => {
      // create inactive company
      const inactiveUser = await createUser({
        email: 'inactive@users.com',
        firstName: 'In',
        lastName: 'Active',
        password: 'developer',
        role: roles.USER.code,
        status: '',
        registrationConfirmed: true,
      }, 'inactive');

      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .query('sortField=status')
        .query('sortOrder=desc');

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(6);
      expect(body.meta).toMatchObject({
        type: 'users',
        count: 6,
        totalCount: 6,
      });

      // expect first user status to be INACTIVE
      expect(body.data[0].status.code).toEqual('INACTIVE');
      expect(body.data[0].id).toEqual(inactiveUser.id);

      // cleanup
      await removeUser(inactiveUser.id);
    });

    it('Should return all users when invalid sorting field is provided', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .query('sortField=invalidField')
        .query('sortOrder=desc');

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(5);
      expect(body.meta).toMatchObject({
        type: 'users',
        count: 5,
        totalCount: 5,
      });

      const sorted = _.sortBy(users, 'email').reverse(); // Default sorting order
      body.data.forEach((user, index) => {
        expect(user.email).toEqual(sorted[index].email);
      });
    });

    it('Should return all users matching `willem` in email', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users`)
        .set('Authorization', `Bearer ${tokens.admin}`)
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
        .set('Accept-Language', 'nl')
        .set('Authorization', `Bearer ${tokens.regular}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.NO_PERMISSION.code);
      expect(body.errors[0].title).toEqual(errors.NO_PERMISSION.message);
    });
  });

  describe('GET /:userId', () => {
    let user;

    beforeAll(async () => {
      user = await createUser(validUser, 'active');
    });

    afterAll(async () => {
      await clearUserData(); // Clear user db (except users for tokens)
    });

    it('Should succesfully return user via id', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${tokens.admin}`);

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toMatchObject({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: findRoleByCode(user.role.code),
      });

      Joi.validate(body, userByIdSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should throw an error when user id is not a valid guid', async () => {
      const { status } = await request(app)
        .get(`${prefix}/users/unknownId`)
        .set('Authorization', `Bearer ${tokens.admin}`);
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw an error when user does not exist', async () => {
      const { status } = await request(app)
        .get(`${prefix}/users/${faker.random.uuid()}`)
        .set('Authorization', `Bearer ${tokens.admin}`);
      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error when user has no admin rights', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${tokens.regular}`);

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
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          email: 'test@unknown.com',
          firstName: 'Test',
          lastName: 'Unknown',
          password: 'developer',
          status: 'ACTIVE',
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

      const { body, status } = await request(app)
        .post(`${prefix}/users`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .query('changePassword=true')
        .send({
          email: 'test@changePw.com',
          firstName: 'Test',
          lastName: 'Unknown',
          status: 'ACTIVE',
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
      expect(createdUser.registrationConfirmed).toEqual(false);
      expect(createdUser.status.code).toEqual('ACTIVE');
    });

    it('Should throw an error when trying to create a user without changing pw and not providing pw', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/users`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          status: 'ACTIVE',
          role: roles.ADMIN.code,
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body.errors[0].code).toEqual(errors.INVALID_INPUT.code);
      expect(body.errors[0].title).toEqual(errors.INVALID_INPUT.message);
    });

    it('Should throw an error when trying to create a duplicate user', async () => {
      const { status } = await request(app)
        .post(`${prefix}/users`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          password: 'developer',
          status: 'ACTIVE',
          role: roles.ADMIN.code,
        });
      expect(status).toEqual(httpStatus.CREATED);

      const { status: status2 } = await request(app)
        .post(`${prefix}/users`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          password: 'developer',
          status: 'ACTIVE',
          role: roles.ADMIN.code,
        });
      expect(status2).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw an error when status is not found', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/users`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          email: 'random@unknown.com',
          firstName: 'Test',
          lastName: 'Unknown',
          password: 'developer',
          status: 'INVALID',
          role: roles.ADMIN.code,
        });

      expect(status).toEqual(httpStatus.NOT_FOUND);
      expect(body.errors[0].code).toEqual(errors.STATUS_NOT_FOUND.code);
      expect(body.errors[0].title).toEqual(errors.STATUS_NOT_FOUND.message);
    });

    it('Should throw a validation error when password does not have the minimum length', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/users`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          email: 'test@noPw124.com',
          firstName: 'Test',
          lastName: 'Unknown',
          password: '1',
          status: 'ACTIVE',
          role: roles.ADMIN.code,
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body.errors[0].code).toEqual(errors.INVALID_INPUT.code);
      expect(body.errors[0].title).toEqual(errors.INVALID_INPUT.message);
    });

    it('Should throw a validation error when not all fields are provided', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/users`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          email: 'test@unknown.com',
          firstName: 'Test',
          lastName: 'Unknown',
          password: 'developer',
          status: 'ACTIVE',
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body.errors[0].code).toEqual(errors.INVALID_INPUT.code);
      expect(body.errors[0].title).toEqual(errors.INVALID_INPUT.message);
    });

    it('Should throw an error when user has no admin rights', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/users`)
        .set('Authorization', `Bearer ${tokens.regular}`)
        .send({
          email: 'test@unknown.com',
          firstName: 'Test',
          lastName: 'Unknown',
          password: 'developer',
          status: 'ACTIVE',
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
      user = await createUser(validUser, 'active');
    });

    afterAll(async () => {
      await clearUserData(); // Clear user db (except users for tokens)
    });

    it('Should succesfully update an existing user', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          role: roles.ADMIN.code,
          status: 'ACTIVE',
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
        role: findRoleByCode(roles.ADMIN.code),
      });
    });

    it('Should throw an error when user id is not a valid guid', async () => {
      const { status } = await request(app)
        .put(`${prefix}/users/unknownId`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          role: roles.ADMIN.code,
          status: 'ACTIVE',
        });
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw an error when user does not exist', async () => {
      const { status } = await request(app)
        .put(`${prefix}/users/${faker.random.uuid()}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          role: roles.ADMIN.code,
          status: 'ACTIVE',
        });
      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error when not all fields are provided', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          status: 'ACTIVE',
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body.errors[0].code).toEqual(errors.INVALID_INPUT.code);
      expect(body.errors[0].title).toEqual(errors.INVALID_INPUT.message);
    });

    it('Should throw an error when trying to manually update registrationCompleted status', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          role: roles.ADMIN.code,
          registrationCompleted: true,
          status: 'ACTIVE',
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body.errors[0].code).toEqual(errors.INVALID_INPUT.code);
      expect(body.errors[0].title).toEqual(errors.INVALID_INPUT.message);
      expect(body.errors[0].detail[0].messages[0]).toMatch(/"registrationCompleted" is not allowed/);
    });

    it('Should throw an error when user has no admin rights', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${tokens.regular}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
          role: roles.ADMIN.code,
          status: 'ACTIVE',
        });

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.NO_PERMISSION.code);
      expect(body.errors[0].title).toEqual(errors.NO_PERMISSION.message);
    });
  });

  describe('PUT /:userId/password', () => {
    let user;

    beforeAll(async () => {
      user = await createUser(validUser, 'active');
    });

    afterAll(async () => {
      await clearUserData(); // Clear user db (except users for tokens)
    });

    it('Should succesfully update an existing user password', async () => {
      const { status } = await request(app)
        .put(`${prefix}/users/${user.id}/password`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          password: 'myNewPw',
        });

      expect(status).toEqual(httpStatus.OK);
      const updatedUser = await findById(user.id);
      expect(updatedUser.status.code).toEqual('ACTIVE');

      const { status: status2 } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: user.email,
          password: 'myNewPw',
        });
      expect(status2).toEqual(httpStatus.OK);
    });

    it('Should throw an error when user id is not a valid guid', async () => {
      const { status } = await request(app)
        .put(`${prefix}/users/unknownId/password`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          password: 'myNewPw',
        });
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw an error when user does not exist', async () => {
      const { status } = await request(app)
        .put(`${prefix}/users/${faker.random.uuid()}/password`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          password: 'myNewPw',
        });
      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error when not all fields are provided', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/users/${user.id}/password`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({});

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body.errors[0].code).toEqual(errors.INVALID_INPUT.code);
      expect(body.errors[0].title).toEqual(errors.INVALID_INPUT.message);
    });

    it('Should throw an error when user has no admin rights', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/users/${user.id}/password`)
        .set('Authorization', `Bearer ${tokens.regular}`)
        .send({
          password: 'myNewPw',
        });

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.NO_PERMISSION.code);
      expect(body.errors[0].title).toEqual(errors.NO_PERMISSION.message);
    });
  });

  describe('PATCH /:userId', () => {
    let user;

    beforeAll(async () => {
      user = await createUser(validUser, 'active');
    });

    afterAll(async () => {
      await clearUserData(); // Clear user db (except users for tokens)
    });

    it('Should succesfully update the property of an existing user', async () => {
      const { body, status } = await request(app)
        .patch(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
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
        role: user.role,
      });
    });

    it('Should succesfully update the status of an existing user', async () => {
      const { status } = await request(app)
        .patch(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          status: 'INACTIVE',
        });

      expect(status).toEqual(httpStatus.OK);
      const updated = await findById(user.id);
      expect(updated.status.code).toEqual('INACTIVE');
    });

    it('Should throw an error when an invalid property is provided', async () => {
      const { body, status } = await request(app)
        .patch(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          unknownStuff: 'test@unknown2.com',
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body.errors[0].code).toEqual(errors.INVALID_INPUT.code);
      expect(body.errors[0].title).toEqual(errors.INVALID_INPUT.message);
    });

    it('Should throw an error when user id is not a valid guid', async () => {
      const { status } = await request(app)
        .patch(`${prefix}/users/unknownId`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          email: 'test@unknown2.com',
        });
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw an error when user does not exist', async () => {
      const { status } = await request(app)
        .patch(`${prefix}/users/${faker.random.uuid()}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          email: 'test@unknown2.com',
        });
      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error when status does not exist', async () => {
      const { status } = await request(app)
        .patch(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          status: 'unknownStatus',
        });
      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error when user has no admin rights', async () => {
      const { body, status } = await request(app)
        .patch(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${tokens.regular}`)
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
      user = await createUser(validUser, 'active');
    });

    afterAll(async () => {
      await clearUserData(); // Clear user db (except users for tokens)
    });

    it('Should succesfully delete an existing user', async () => {
      const { body, status } = await request(app)
        .delete(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${tokens.admin}`);

      expect(status).toEqual(httpStatus.NO_CONTENT);
      expect(body).toEqual({});

      const removed = await findById(user.id);
      expect(removed).toBeUndefined();
    });

    it('Should throw an error when trying to delete your own user', async () => {
      const newUser = await createUser(Object.assign({}, validUser, { email: 'notnotexisting@hotmail.com' }), 'active');
      const validJwt = await getValidJwt(newUser.id);

      const { body, status } = await request(app)
        .delete(`${prefix}/users/${newUser.id}`)
        .set('Authorization', `Bearer ${validJwt}`);

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body.errors[0].code).toEqual(errors.USER_DELETE_OWN.code);
      expect(body.errors[0].title).toEqual(errors.USER_DELETE_OWN.message);
    });

    it('Should throw an error when user does not exist', async () => {
      const { status } = await request(app)
        .delete(`${prefix}/users/${faker.random.uuid()}`)
        .set('Authorization', `Bearer ${tokens.admin}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error when user id is not a valid guid', async () => {
      const { status } = await request(app)
        .delete(`${prefix}/users/unknownId`)
        .set('Authorization', `Bearer ${tokens.admin}`);

      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw an error when user has no admin rights', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/users/${user.id}`)
        .set('Authorization', `Bearer ${tokens.regular}`)
        .send({
          email: 'test@unknown2.com',
          firstName: 'Test',
          lastName: 'Unknown',
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
        .set('Authorization', `Bearer ${tokens.admin}`);

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
        .set('Authorization', `Bearer ${tokens.regular}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.NO_PERMISSION.code);
      expect(body.errors[0].title).toEqual(errors.NO_PERMISSION.message);
    });
  });
});
