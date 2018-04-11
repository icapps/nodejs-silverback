import * as request from 'supertest';
import * as httpStatus from 'http-status';
import * as Joi from 'joi';
import { app } from '../../src/app';
import { errors } from '../../src/config/errors.config';
import { clearAll } from '../_helpers/mockdata/data';
import { createUser, validUser, findById, regularUser, setResetPwToken, clearUserData } from '../_helpers/mockdata/user.data';
import { loginSchema } from '../_helpers/payload-schemes/auth.schema';
import { getValidJwt, getUserToken } from '../_helpers/mockdata/auth.data';

import * as mailer from '../../src/lib/mailer';

describe('/auth', () => {
  const prefix = `/api/${process.env.API_VERSION}`;
  let user;

  beforeAll(async () => {
    await clearAll();
    user = await createUser(validUser);
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
          username: validUser.email,
          password: validUser.password,
        });

      expect(status).toEqual(httpStatus.OK);
      Joi.validate(body, loginSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should throw error when no username or password is provided', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          username: validUser.email,
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw error when invalid password is provided', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          username: validUser.email,
          password: 'invalidPw',
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw error when unknown email is provided', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          username: 'unknown@test.com',
          password: validUser.password,
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw error when user has no access', async () => {
      const noAccessUser = await createUser(Object.assign({}, validUser, { email: 'newuser@gmail.com', hasAccess: false }));
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          username: 'newuser@gmail.com',
          password: validUser.password,
        });

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.USER_INACTIVE.code);
      expect(body.errors[0].title).toEqual(errors.USER_INACTIVE.message);
    });

  });

  describe('POST /forgot-password/init', () => {
    const mailSpy = jest.spyOn(mailer, 'sendTemplate').mockImplementation(() => Promise.resolve());
    it('Should succesfully send a forgot password email with unique link', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/forgot-password/init`)
        .send({ email: user.email });

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

      // Try to login with changed password
      const { body: body2, status: status2 } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          username: newUser.email,
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
