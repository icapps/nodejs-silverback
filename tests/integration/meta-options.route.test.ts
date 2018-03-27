import * as request from 'supertest';
import * as Joi from 'joi';
import * as httpStatus from 'http-status';
import * as faker from 'faker';

import { app } from '../../src/app';
import { clearAll } from '../_helpers/mockdata/data';
import { validUsers, createUsers } from '../_helpers/mockdata/user.data';
import { createCodeType, createCodes, clearCodeTypesData, clearCodesData } from '../_helpers/mockdata/meta-options.data';
import { getValidJwt, getAdminToken, getUserToken } from '../_helpers/mockdata/auth.data';
import { codeTypesSchema, codesSchema } from '../_helpers/payload-schemes/metaOptions.schema';
import { errors } from '../../src/config/errors.config';

describe('/meta-options', () => {
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
  });

  describe('GET /codeTypes', () => {
    const prefix = `/api/${process.env.API_VERSION}`;
    let codeType;

    beforeAll(async () => {
      codeType = await createCodeType({ code: 'LAN', description: 'Languages' });
      await createCodeType({ code: 'CNTRY', description: 'Countries' });
    });

    afterAll(async () => {
      await clearCodeTypesData();
      await clearCodesData();
    });

    it('Should return all codeTypes with default pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta-options/codeTypes`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toEqual(httpStatus.OK);
      expect(body.meta).toMatchObject({
        type: 'codeTypes',
        count: 2,
        totalCount: 2,
      });

      Joi.validate(body, codeTypesSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should return all codeTypes with provided pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta-options/codeTypes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query('limit=1')
        .query('offset=1');

      expect(status).toEqual(httpStatus.OK);
      expect(body.meta).toMatchObject({
        type: 'codeTypes',
        count: 1,
        totalCount: 2,
      });

      Joi.validate(body, codeTypesSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should throw an error when userId in jwt is not found', async () => {
      const invalidToken = await getValidJwt(faker.random.uuid());
      const { body, status } = await request(app)
        .get(`${prefix}/meta-options/codeTypes`)
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error without admin permission', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta-options/codeTypes`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.UNAUTHORIZED.code);
      expect(body.errors[0].title).toEqual(errors.UNAUTHORIZED.message);
    });

    it('Should throw an error without jwt token provided', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta-options/codeTypes`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.UNAUTHORIZED.code);
      expect(body.errors[0].title).toEqual(errors.UNAUTHORIZED.message);
    });
  });

  describe('GET /codes', () => {
    const prefix = `/api/${process.env.API_VERSION}`;
    let codeType;

    beforeAll(async () => {
      codeType = await createCodeType({ code: 'LAN', description: 'Languages' });
      await createCodes({ codeType: codeType[0], value: 'EN' });
      await createCodes({ codeType: codeType[0], value: 'NL' });
      await createCodes({ codeType: codeType[0], value: 'FR' });

      const countryCodeType = await createCodeType({ code: 'CNTRY', description: 'Countries' });
      await createCodes({ codeType: countryCodeType[0], value: 'BE' });
      await createCodes({ codeType: countryCodeType[0], value: 'DE' });
      await createCodes({ codeType: countryCodeType[0], value: 'PL' });
    });

    afterAll(async () => {
      await clearCodeTypesData();
    });

    it('Should return all codes with default pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta-options/codes`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toEqual(httpStatus.OK);
      expect(body.meta).toMatchObject({
        type: 'codes',
        count: 6,
        totalCount: 6,
      });


      Joi.validate(body, codesSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should return all codes for a specific codeType with default pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta-options/codes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query(`codeId=${codeType[0].id}`);

      expect(status).toEqual(httpStatus.OK);
      expect(body.meta).toMatchObject({
        type: 'codes',
        count: 3,
        totalCount: 3,
      });

      Joi.validate(body, codesSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should return all codes with provided pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta-options/codes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query('limit=1')
        .query('offset=2');

      expect(status).toEqual(httpStatus.OK);
      expect(body.meta).toMatchObject({
        type: 'codes',
        count: 1,
        totalCount: 6,
      });

      Joi.validate(body, codesSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should throw an error when userId in jwt is not found', async () => {
      const invalidToken = await getValidJwt(faker.random.uuid());
      const { body, status } = await request(app)
        .get(`${prefix}/meta-options/codes`)
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error without admin permission', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta-options/codes`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.UNAUTHORIZED.code);
      expect(body.errors[0].title).toEqual(errors.UNAUTHORIZED.message);
    });

    it('Should throw an error without jwt token provided', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta-options/codes`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.UNAUTHORIZED.code);
      expect(body.errors[0].title).toEqual(errors.UNAUTHORIZED.message);
    });
  });
});
