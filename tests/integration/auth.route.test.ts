import * as httpStatus from 'http-status';
import * as Joi from 'joi';
import * as request from 'supertest';
import { app } from '../../src/app';
import { errors } from '../../src/config/errors.config';
import * as mailer from '../../src/lib/mailer';
import { getUserSessionToken } from '../_helpers/mockdata/auth.data';
import { clearAll } from '../_helpers/mockdata/data';
<<<<<<< HEAD
import { adminUser, createUser, findById, regularUser, setResetPwToken, unconfirmedUser, createUsers, removeUser }
from '../_helpers/mockdata/user.data';
=======
// tslint:disable-next-line:max-line-length
import { adminUser, createUser, findById, regularUser, setResetPwToken, unconfirmedUser, createUsers, removeUser } from '../_helpers/mockdata/user.data';
>>>>>>> int -> unit tests WIP
import { loginSchema } from '../_helpers/payload-schemes/auth.schema';

describe('/auth', () => {
  const prefix = `/api/${process.env.API_VERSION}`;
  const users = { regular: null, admin: null };

  beforeAll(async () => {
    await clearAll();

    // Create a regular and admin user
    const { data: createdUsers } = await createUsers([regularUser, adminUser], 'active');
    const sorted = createdUsers.sort((a, b) => a.role.code.localeCompare(b.role.code));
    [users.admin, users.regular] = sorted;
  });

  afterAll(async () => {
    await clearAll();
    jest.clearAllMocks();
  });

  describe('POST /login', () => {
    it('Should succesfully login a user with correct credentials', async () => {
      const { header, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: regularUser.email,
          password: regularUser.password,
        });

      expect(status).toEqual(httpStatus.OK);
      expect(header).toHaveProperty('set-cookie');
    });

<<<<<<< HEAD
    it('Should succesfully login a user with correct credentials case insensitive', async () => {
      const { header, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: regularUser.email.toUpperCase(),
          password: regularUser.password,
        });

      expect(status).toEqual(httpStatus.OK);
      expect(header).toHaveProperty('set-cookie');
    });

    it('Should throw error when no email or password is provided', async () => {
      const { status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: regularUser.email,
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw error when invalid email is provided', async () => {
      const { status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: 'noValidEmail',
          password: 'prutser123',
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

=======
>>>>>>> int -> unit tests WIP
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
<<<<<<< HEAD

    it('Should throw error when invalid user is provided', async () => {
      const { status } = await request(app)
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

    it('Should throw error when user has not yet confirmed his registration', async () => {
      const noAccessUser = await createUser(Object.assign({}, unconfirmedUser, { email: 'newuser98@gmail.com' }), 'active');
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: noAccessUser.email,
          password: 'developer',
        });

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.USER_UNCONFIRMED.code);
      expect(body.errors[0].title).toEqual(errors.USER_UNCONFIRMED.message);
    });

    it('Should throw error when user has been set to inactive', async () => {
      const noAccessUser = await createUser(Object.assign({}, regularUser, { email: 'newuser12@gmail.com' }), 'inactive');
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: noAccessUser.email,
          password: 'developer',
        });

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.USER_INACTIVE.code);
      expect(body.errors[0].title).toEqual(errors.USER_INACTIVE.message);
    });
=======
>>>>>>> int -> unit tests WIP
  });

  describe('POST /login/jwt', () => {
    it('Should succesfully login a user with correct credentials', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login/jwt`)
        .send({
          email: regularUser.email,
          password: regularUser.password,
        });

      expect(status).toEqual(httpStatus.OK);
      Joi.validate(body, loginSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

<<<<<<< HEAD
    it('Should succesfully login a user with correct credentials case insensitive', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login/jwt`)
        .send({
          email: regularUser.email.toUpperCase(),
          password: regularUser.password,
        });

      expect(status).toEqual(httpStatus.OK);
      Joi.validate(body, loginSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should throw error when no email or password is provided', async () => {
      const { status } = await request(app)
        .post(`${prefix}/auth/login/jwt`)
        .send({
          email: regularUser.email,
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw error when invalid email is provided', async () => {
      const { status } = await request(app)
        .post(`${prefix}/auth/login/jwt`)
        .send({
          email: 'noValidEmail',
          password: 'prutser123',
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

=======
>>>>>>> int -> unit tests WIP
    it('Should throw error when invalid password is provided', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login/jwt`)
        .send({
          email: regularUser.email,
          password: 'invalidPw',
        });
      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body.errors[0].code).toEqual(errors.USER_INVALID_CREDENTIALS.code);
      expect(body.errors[0].detail).toEqual(errors.USER_INVALID_CREDENTIALS.message);
    });
<<<<<<< HEAD
    it('Should throw error when invalid user is provided', async () => {
      const { status } = await request(app)
        .post(`${prefix}/auth/login/jwt`)
        .send({
          email: 'fakeuser@icapps.com',
          password: 'invalidPw',
        });
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should throw error when unknown email is provided', async () => {
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login/jwt`)
        .send({
          email: 'unknown@test.com',
          password: regularUser.password,
        });

      expect(status).toEqual(httpStatus.BAD_REQUEST);
      expect(body.errors[0].code).toEqual(errors.USER_INVALID_CREDENTIALS.code);
      expect(body.errors[0].detail).toEqual(errors.USER_INVALID_CREDENTIALS.message);
    });

    it('Should throw error when user has not yet confirmed his registration', async () => {
      const noAccessUser = await createUser(Object.assign({}, unconfirmedUser, { email: 'newuser@gmail.com' }), 'active');
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login/jwt`)
        .send({
          email: noAccessUser.email,
          password: 'developer',
        });

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.USER_UNCONFIRMED.code);
      expect(body.errors[0].title).toEqual(errors.USER_UNCONFIRMED.message);
    });

    it('Should throw error when user has been set to inactive', async () => {
      const noAccessUser = await createUser(Object.assign({}, regularUser, { email: 'newuser2@gmail.com' }), 'inactive');
      const { body, status } = await request(app)
        .post(`${prefix}/auth/login/jwt`)
        .send({
          email: noAccessUser.email,
          password: 'developer',
        });

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.USER_INACTIVE.code);
      expect(body.errors[0].title).toEqual(errors.USER_INACTIVE.message);
    });

=======
>>>>>>> int -> unit tests WIP
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

  describe('POST /logout', () => {
    it('Should succesfully logout an active user', async () => {
      const { status, header } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: regularUser.email,
          password: regularUser.password,
        });

      expect(status).toEqual(httpStatus.OK);
      const accessToken = header['set-cookie'];

      const { status: status2, header: header2 } = await request(app)
        .post(`${prefix}/auth/logout`)
        .set('Cookie', accessToken);

      expect(status2).toEqual(httpStatus.OK);
      expect(header2).not.toHaveProperty('set-cookie');
    });

    it('Should throw an error when user was not found', async () => {
      const customUser = Object.assign({}, adminUser, { email: 'notfounduser1234@hotmail.com' });
      const newUser: any = await createUser(customUser, 'active');
      const validToken: any = await getUserSessionToken(customUser);
      await removeUser(newUser.id);

      const { status } = await request(app)
        .post(`${prefix}/auth/logout`)
        .set('Cookie', validToken);

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /forgot-password/init', () => {
    jest.spyOn(mailer, 'sendTemplate').mockImplementation(() => Promise.resolve());
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
      newUser = await createUser(userData, 'active');
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
<<<<<<< HEAD

    it('Should throw an error when no token is provided', async () => {
      const { status } = await request(app)
        .get(`${prefix}/forgot-password/verify`);
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });
=======
>>>>>>> int -> unit tests WIP
  });

  describe('PUT /forgot-password/confirm?token=', () => {
    let newUser;

    beforeAll(async () => {
      const userData = Object.assign({}, unconfirmedUser, { email: 'confirmPw@test.com' });
      newUser = await createUser(userData, 'active');
    });

    it('Should succesfully verify existing valid token', async () => {
      const token = await setResetPwToken(newUser.id);
      const { body, status } = await request(app)
        .put(`${prefix}/forgot-password/confirm?token=${token}`)
        .send({ password: 'newPassword123' });

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual({});

      const updatedUser = await findById(newUser.id);
      expect(updatedUser.status.code).toEqual('ACTIVE');

      // Try to login with changed password
      const { status: status2 } = await request(app)
        .post(`${prefix}/auth/login`)
        .send({
          email: newUser.email,
          password: 'newPassword123',
        });
      expect(status2).toEqual(httpStatus.OK);
    });

    it('Should throw an error when the token is invalid', async () => {
      await setResetPwToken(users.regular.id);
      const { status } = await request(app)
        .put(`${prefix}/forgot-password/confirm?token=invalidToken`)
        .send({ password: 'newPassword123' });

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });
<<<<<<< HEAD

    it('Should throw an error when no password is provided', async () => {
      const token = await setResetPwToken(users.regular.id);
      const { status } = await request(app)
        .put(`${prefix}/forgot-password/confirm?token=${token}`);
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });
=======
>>>>>>> int -> unit tests WIP
  });
});
