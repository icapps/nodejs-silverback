import * as faker from 'faker';
import * as httpStatus from 'http-status';
import * as Joi from 'joi';
import * as request from 'supertest';
import { app } from '../../src/app';
import { errors } from '../../src/config/errors.config';
import { roles } from '../../src/config/roles.config';
import { getUserToken, getValidJwt } from '../_helpers/mockdata/auth.data';
import { clearAll } from '../_helpers/mockdata/data';
import { createUser, regularUser } from '../_helpers/mockdata/user.data';
import { createUserSchema, userByIdSchema } from '../_helpers/payload-schemes/user.schema';

describe('/me', () => {
  const prefix = `/api/${process.env.API_VERSION}`;
  let userToken;

  beforeAll(async () => {
    await clearAll(); // Full db clear

    const user = await createUser(regularUser, 'registered');
    userToken = await getUserToken(user);
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

  describe('PUT /', () => {
    it('Should succesfully update personal user\'s information', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/me`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'test@unknown12.com',
          firstName: 'Test',
          lastName: 'Unknown',
          role: roles.ADMIN.code,
          status: 'REGISTERED',
        });

      expect(status).toEqual(httpStatus.OK);
      Joi.validate(body, createUserSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should throw an error when user status does not exist', async () => {
      const { body, status } = await request(app)
        .put(`${prefix}/me`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'test@unknown12.com',
          firstName: 'Test',
          lastName: 'Unknown',
          role: roles.ADMIN.code,
          status: 'NON_EXISTING_STATUS',
        });

      expect(status).toEqual(httpStatus.NOT_FOUND);
      expect(body.errors[0].code).toEqual(errors.STATUS_NOT_FOUND.code);
      expect(body.errors[0].detail).toEqual(errors.STATUS_NOT_FOUND.message);
    });

    it('Should throw an error when user does not exist', async () => {
      const token = await getValidJwt(faker.random.uuid());
      const { body, status } = await request(app)
        .put(`${prefix}/me`)
        .set('Authorization', `Bearer ${token}`);
      expect(status).toEqual(httpStatus.NOT_FOUND);
    });
  });
});
