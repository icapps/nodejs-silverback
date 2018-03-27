import * as request from 'supertest';
import * as httpStatus from 'http-status';
import * as Joi from 'joi';
import { app } from '../../src/app';
import { errors } from '../../src/config/errors.config';
import { clearAll } from '../_helpers/mockdata/data';
import { createUser, validUser } from '../_helpers/mockdata/user.data';
import { loginSchema } from '../_helpers/payload-schemes/auth.schema';
import { getValidJwt } from '../_helpers/mockdata/auth.data';

describe('/auth', () => {
  describe('POST /login', () => {
    const prefix = `/api/${process.env.API_VERSION}`;
    let user;

    beforeAll(async () => {
      await clearAll();
      user = await createUser(validUser);
    });

    afterAll(async () => {
      await clearAll();
    });

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
});
