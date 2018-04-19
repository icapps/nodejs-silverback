import * as request from 'supertest';
import * as httpStatus from 'http-status';
import * as Joi from 'joi';
import * as faker from 'faker';
import { app } from '../../src/app';
import { errors } from '../../src/config/errors.config';
import { clearAll } from '../_helpers/mockdata/data';
import { createUser, validUser, findById, regularUser, setResetPwToken, clearUserData } from '../_helpers/mockdata/user.data';
import { loginSchema } from '../_helpers/payload-schemes/auth.schema';
import { getUserToken, getValidJwt } from '../_helpers/mockdata/auth.data';
import { userByIdSchema } from '../_helpers/payload-schemes/user.schema';
import * as mailer from '../../src/lib/mailer';

describe('/me', () => {
  const prefix = `/api/${process.env.API_VERSION}`;
  let userToken;

  beforeAll(async () => {
    await clearAll(); // Full db clear
    userToken = await getUserToken(); // Also creates user
  });

  afterAll(async () => {
    await clearAll();
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('Should succesfully return personal user\'s information', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/me`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(status).toEqual(httpStatus.OK);
      Joi.validate(body, userByIdSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should throw an error when user does not exist', async () => {
      const token = await getValidJwt(faker.random.uuid());
      const { body, status } = await request(app)
        .get(`${prefix}/me`)
        .set('Authorization', `Bearer ${token}`);
      expect(status).toEqual(httpStatus.NOT_FOUND);
    });
  });

});
