import * as request from 'supertest';
import * as Joi from 'joi';
import * as httpStatus from 'http-status';
import * as faker from 'faker';
import { sortBy } from 'lodash';

import { app } from '../../src/app';
import { clearAll } from '../_helpers/mockdata/data';
import { validUsers, createUsers } from '../_helpers/mockdata/user.data';
import { createCodeType, createCode, clearCodeTypesData, clearCodesData } from '../_helpers/mockdata/meta.data';
import { getValidJwt, getAdminToken, getUserToken } from '../_helpers/mockdata/auth.data';
import { codeTypesSchema, codesSchema } from '../_helpers/payload-schemes/meta.schema';
import { errors } from '../../src/config/errors.config';

describe('/meta', () => {
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

  describe('GET /code-types', () => {
    const prefix = `/api/${process.env.API_VERSION}`;
    let codeTypes;

    beforeAll(async () => {
      const codeType1 = await createCodeType({ code: 'LAN', description: 'Languages' });
      const codeType2 = await createCodeType({ code: 'CNTRY', description: 'Countries' });
      codeTypes = [codeType1, codeType2];
    });

    afterAll(async () => {
      await clearCodeTypesData();
      await clearCodesData();
    });

    it('Should return all codeTypes with default pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/code-types`)
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
        .get(`${prefix}/meta/code-types`)
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

    it('Should return codeTypes in descending order for code', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/code-types`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query('sortField=code')
        .query('sortOrder=desc');

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(2);
      expect(body.meta).toMatchObject({
        type: 'codeTypes',
        count: 2,
        totalCount: 2,
      });

      const sorted = sortBy(codeTypes, 'code').reverse();
      body.data.forEach((codeType, index) => {
        expect(codeType.code).toEqual(sorted[index].code);
      });
    });

    it('Should throw an error when userId in jwt is not found', async () => {
      const invalidToken = await getValidJwt(faker.random.uuid());
      const { body, status } = await request(app)
        .get(`${prefix}/meta/code-types`)
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error without admin permission', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/code-types`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.UNAUTHORIZED.code);
      expect(body.errors[0].title).toEqual(errors.UNAUTHORIZED.message);
    });

    it('Should throw an error without jwt token provided', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/code-types`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.UNAUTHORIZED.code);
      expect(body.errors[0].title).toEqual(errors.UNAUTHORIZED.message);
    });
  });

  describe('GET /codes', () => {
    const prefix = `/api/${process.env.API_VERSION}`;
    let codeType;
    let languageCodes;

    beforeAll(async () => {
      codeType = await createCodeType({ code: 'LAN', description: 'Languages' });
      const code1 = await createCode({ codeType, value: 'EN' });
      const code2 = await createCode({ codeType, value: 'NL' });
      const code3 = await createCode({ codeType, value: 'FR' });
      const code4 = await createCode({ codeType, value: 'WEUTELS' });
      languageCodes = [code1, code2, code3, code4];

      const countryCodeType = await createCodeType({ code: 'CNTRY', description: 'Countries' });
      createCode({ codeType: countryCodeType, value: 'BE' });
      createCode({ codeType: countryCodeType, value: 'DE' });
      createCode({ codeType: countryCodeType, value: 'PL' });

    });

    afterAll(async () => {
      await clearCodeTypesData();
    });

    it('Should return all codes with default pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toEqual(httpStatus.OK);
      expect(body.meta).toMatchObject({
        type: 'codes',
        count: 7,
        totalCount: 7,
      });


      Joi.validate(body, codesSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should return all codes for a specific codeType with default pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query(`codeId=${codeType.id}`);

      expect(status).toEqual(httpStatus.OK);
      expect(body.meta).toMatchObject({
        type: 'codes',
        count: 4,
        totalCount: 4,
      });

      Joi.validate(body, codesSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should return all codes with provided pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query('limit=1')
        .query('offset=2');

      expect(status).toEqual(httpStatus.OK);
      expect(body.meta).toMatchObject({
        type: 'codes',
        count: 1,
        totalCount: 7,
      });

      Joi.validate(body, codesSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    it('Should return codes in ascending order for value', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query(`codeId=${codeType.id}`)
        .query('sortField=value')
        .query('sortOrder=asc');

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(4);
      expect(body.meta).toMatchObject({
        type: 'codes',
        count: 4,
        totalCount: 4,
      });

      const sorted = sortBy(languageCodes, 'value');
      body.data.forEach((code, index) => {
        expect(code.value).toEqual(sorted[index].value);
      });
    });

    it('Should return all codes matching `EN` in value', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query(`codeId=${codeType.id}`)
        .query('search=EN');

      expect(status).toEqual(httpStatus.OK);
      expect(body.data).toHaveLength(1);
      expect(body.meta).toMatchObject({
        type: 'codes',
        count: 1,
        totalCount: 1,
      });

      const found = languageCodes.find(x => x.value === 'EN');
      expect(body.data[0].value).toEqual(found.value);
    });

    it('Should throw an error when userId in jwt is not found', async () => {
      const invalidToken = await getValidJwt(faker.random.uuid());
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes`)
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('Should throw an error without admin permission', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.UNAUTHORIZED.code);
      expect(body.errors[0].title).toEqual(errors.UNAUTHORIZED.message);
    });

    it('Should throw an error without jwt token provided', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.UNAUTHORIZED.code);
      expect(body.errors[0].title).toEqual(errors.UNAUTHORIZED.message);
    });
  });
});
