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
import { getValidJwt, getAdminToken, getUserToken, getUnconfirmedUserToken, getNoStateUserToken, getBlockedStateUserToken } from '../_helpers/mockdata/auth.data';
import { roles } from '../../src/config/roles.config';
import { errors } from '../../src/config/errors.config';
import { findRoleByCode } from '../../src/lib/utils';
import * as mailer from '../../src/lib/mailer';
import { statuses  } from '../../src/config/statuses.config';

describe('/users', () => {
  const prefix = `/api/${process.env.API_VERSION}`;
  let userToken;
  let adminToken;
  let unconfirmedToken;
  let noStateToken;
  let blockedStateToken;

  beforeAll(async () => {
    await clearAll(); // Full db clear
    unconfirmedToken = await getUnconfirmedUserToken(); // Also creates user
    noStateToken = await getNoStateUserToken();
    userToken = await getUserToken(); // Also creates user
    adminToken = await getAdminToken(); // Also creates user
    blockedStateToken = await getBlockedStateUserToken(); // Also creates user
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

    it('Should 200 if user has status REGISTERD', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/me`)
        .set('Accept-Language', 'nl')
        .set('Authorization', `Bearer ${userToken}`);

      expect(status).toEqual(httpStatus.OK);
    });

    it('Should 401 with USER_UNCONFIRMED message if user has not confirmed e-mail', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/me`)
        .set('Accept-Language', 'nl')
        .set('Authorization', `Bearer ${unconfirmedToken}`);
      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.USER_UNCONFIRMED.code);
    });
    it('Should 401 with if user has no state', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/me`)
        .set('Accept-Language', 'nl')
        .set('Authorization', `Bearer ${noStateToken}`);
      expect(status).toEqual(httpStatus.UNAUTHORIZED);
    });
    it('Should 401 with BLOCKED message if user has not confirmed e-mail', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/me`)
        .set('Accept-Language', 'nl')
        .set('Authorization', `Bearer ${blockedStateToken}`);
      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.USER_BLOCKED.code);
    });
  });
});

