import * as request from 'supertest';
import * as httpStatus from 'http-status';
import * as Joi from 'joi';
import * as faker from 'faker';
import { app } from '../../src/app';
import { errors } from '../../src/config/errors.config';
import { clearAll } from '../_helpers/mockdata/data';
import { createUser, findById, regularUser, setResetPwToken, clearUserData, adminUser } from '../_helpers/mockdata/user.data';
import { loginSchema } from '../_helpers/payload-schemes/auth.schema';
import { getUserToken, getValidJwt } from '../_helpers/mockdata/auth.data';
import * as mailer from '../../src/lib/mailer';

describe('/auth', () => {
  const prefix = `/api/${process.env.API_VERSION}`;
  let user;
  let userAdmin;

  beforeAll(async () => {
    await clearAll();
    user = await createUser(regularUser);
    userAdmin = await createUser(adminUser);
  });

  afterAll(async () => {
    await clearAll();
    jest.clearAllMocks();
  });

  describe('POST /login', () => {
    it('Should succesfully login a user with correct credentials', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: regularUser.email,
          password: regularUser.password,
        });

      expect(status).toEqual(httpStatus.OK);
      Joi.validate(body, loginSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });

      const loggedInUser = await findById(user.id);
      expect(loggedInUser.refreshToken).toEqual(body.data.refreshToken);
    });

    it('Should succesfully login a user with correct credentials case insensitive', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: regularUser.email.toUpperCase(),
          password: regularUser.password,
        });

      expect(status).toEqual(httpStatus.OK);
      Joi.validate(body, loginSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });

      const loggedInUser = await findById(user.id);
      expect(loggedInUser.refreshToken).toEqual(body.data.refreshToken);
    });

    it('Should throw error when no email or password is provided', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: regularUser.email,
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw error when invalid email is provided', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: 'noValidEmail',
          password: 'prutser123',
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw error when invalid password is provided', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: regularUser.email,
          password: 'invalidPw',
        });
      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body.errors[0].code).toEqual(errors.USER_INVALID_CREDENTIALS.code);
      expect(body.errors[0].detail).toEqual(errors.USER_INVALID_CREDENTIALS.message);
    });
    it('Should throw error when invalid user is provided', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: 'fakeuser@icapps.com',
          password: 'invalidPw',
        });
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw error when unknown email is provided', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: 'unknown@test.com',
          password: regularUser.password,
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body.errors[0].code).toEqual(errors.USER_INVALID_CREDENTIALS.code);
      expect(body.errors[0].detail).toEqual(errors.USER_INVALID_CREDENTIALS.message);
    });

    it('Should throw error when user has no access', async () => {
      const noAccessUser = await createUser(Object.assign({}, regularUser, { email: 'newuser@gmail.com', hasAccess: false }));
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: 'newuser@gmail.com',
          password: 'developer',
        });
      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.USER_INACTIVE.code);
      expect(body.errors[0].title).toEqual(errors.USER_INACTIVE.message);
    });

  });

  describe('POST /login/admin', () => {
    it('Should succesfully login a user with correct credentials and ADMIN role', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login/admin`)
        .send({
          email: adminUser.email,
          password: adminUser.password,
        });

      expect(status).toEqual(httpStatus.OK);
      Joi.validate(body, loginSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });

      const loggedInUser = await findById(userAdmin.id);
      expect(loggedInUser.refreshToken).toEqual(body.data.refreshToken);
    });

    it('Should throw error when user has no ADMIN role', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login/admin`)
        .send({
          email: regularUser.email,
          password: regularUser.password,
        });

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.NO_PERMISSION.code);
      expect(body.errors[0].title).toEqual(errors.NO_PERMISSION.message);
    });
  });

  describe('POST /refresh', () => {
    it('Should succesfully refresh an expired access token', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: regularUser.email,
          password: regularUser.password,
        });
      expect(status).toEqual(httpStatus.OK);
      const accessToken = body.data.accessToken;
      const refreshToken = body.data.refreshToken;

      const { body: body2, status: status2 } = await request(app)
        .post(`${prefix}/auth/refresh`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(status2).toEqual(httpStatus.OK);
      Joi.validate(body2, loginSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });

      const loggedInUser = await findById(user.id);
      expect(loggedInUser.refreshToken).not.toEqual(body.data.refreshToken);
      expect(loggedInUser.refreshToken).toEqual(body2.data.refreshToken);
    });

    it('Should throw an error when trying to refresh without valid access token', async () => {
      const invalidToken = await getValidJwt(faker.random.uuid());
      const { status } = await request(app)
        .post(`${prefix}/auth/refresh`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({ refreshToken: 'notFoundToken' });

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /logout', () => {
    it('Should succesfully logout an active user', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: regularUser.email,
          password: regularUser.password,
        });
      expect(status).toEqual(httpStatus.OK);
      const accessToken = body.data.accessToken;

      const { body: body2, status: status2 } = await request(app)
        .post(`${prefix}/auth/logout`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(status2).toEqual(httpStatus.OK);

      const loggedInUser = await findById(user.id);
      expect(loggedInUser.refreshToken).toEqual(null);
    });


    it('Should throw an error when user was not found', async () => {
      const invalidToken = await getValidJwt(faker.random.uuid());
      const { status } = await request(app)
        .post(`${prefix}/auth/logout`)
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /forgot-password/init', () => {
    const mailSpy = jest.spyOn(mailer, 'sendTemplate').mockImplementation(() => Promise.resolve());
    it('Should succesfully send a forgot password email with unique link', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/forgot-password/init`)
        .send({ email: regularUser.email });

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual({});
    });

    it('Should log an internal error when user does not exist', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/forgot-password/init`)
        .send({ email: 'dunno@test.com' });

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual({});
    });
  });

  describe('GET /forgot-password/verify?token=', () => {
    let newUser;

    beforeAll(async () => {
      const userData = Object.assign({}, regularUser, { email: 'verifyPw@test.com' });
      newUser = await createUser(userData);
    });

    it('Should succesfully verify existing valid token', async () => {
      const token = await setResetPwToken(newUser.id);

      const { body, status } = await request(app)
        .get(`${prefix}/forgot-password/verify`)
        .query(`token=${token}`);

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual({});
    });

    it('Should throw an error when invalid token is provided', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/forgot-password/verify`)
        .query('token=unknownToken');
      expect(status).toEqual(httpStatus.NOT_FOUND);
      expect(body.errors[0].code).toEqual(errors.LINK_EXPIRED.code);
      expect(body.errors[0].detail).toEqual(errors.LINK_EXPIRED.message);
    });

    it('Should throw an error when no token is provided', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/forgot-password/verify`);
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });
  });

  describe('PUT /forgot-password/confirm?token=', () => {
    let newUser;

    beforeAll(async () => {
      const userData = Object.assign({}, regularUser, { email: 'confirmPw@test.com' });
      newUser = await createUser(userData);
    });

    it('Should succesfully verify existing valid token', async () => {
      const token = await setResetPwToken(newUser.id);
      const { body, status } = await request(app)
        .put(`${prefix}/forgot-password/confirm?token=${token}`)
        .send({ password: 'newPassword123' });

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual({});

      const updatedUser = await findById(newUser.id);
      expect(updatedUser.registrationCompleted).toEqual(true);

      // Try to login with changed password
      const { body: body2, status: status2 } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: newUser.email,
          password: 'newPassword123',
        });
      expect(status2).toEqual(httpStatus.OK);
    });

    it('Should throw an error when the token is invalid', async () => {
      const token = await setResetPwToken(user.id);
      const { body, status } = await request(app)
        .put(`${prefix}/forgot-password/confirm?token=invalidToken`)
        .send({ password: 'newPassword123' });

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error when no password is provided', async () => {
      const token = await setResetPwToken(user.id);
      const { body, status } = await request(app)
        .put(`${prefix}/forgot-password/confirm?token=${token}`);
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });
  });
});
