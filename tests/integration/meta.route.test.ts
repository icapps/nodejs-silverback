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

  fdescribe('GET /codes', () => {
    const prefix = `/api/${process.env.API_VERSION}`;
    let codeType;
    let countryCodeType;
    let languageCodes;

    beforeAll(async () => {
      codeType = await createCodeType({ code: 'LAN', description: 'Languages' });
      const code1 = await createCode({ codeType, value: 'EN' });
      const code2 = await createCode({ codeType, value: 'NL' });
      const code3 = await createCode({ codeType, value: 'FR' });
      const code4 = await createCode({ codeType, value: 'WEUTELS' });
      languageCodes = [code1, code2, code3, code4];

      countryCodeType = await createCodeType({ code: 'CNTRY', description: 'Countries' });
      createCode({ codeType: countryCodeType, value: 'BE' });
      createCode({ codeType: countryCodeType, value: 'DE' });
      createCode({ codeType: countryCodeType, value: 'PL' });

    });

    afterAll(async () => {
      await clearCodeTypesData();
    });

    fit('Should return all language codes with default pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes/${codeType.code.toLowerCase()}`)
        .set('Authorization', `Bearer ${adminToken}`);

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

    fit('Should return all country codes with provided pagination', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes/${countryCodeType.code.toLowerCase()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .query('limit=1')
        .query('offset=2');

      expect(status).toEqual(httpStatus.OK);
      expect(body.meta).toMatchObject({
        type: 'codes',
        count: 1,
        totalCount: 3,
      });

      Joi.validate(body, codesSchema, (err, value) => {
        if (err) throw err;
        if (!value) throw new Error('no value to check schema');
      });
    });

    fit('Should return codes in ascending order for value', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes/${codeType.code.toLowerCase()}`)
        .set('Authorization', `Bearer ${adminToken}`)
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

    fit('Should return all codes matching `EN` in value', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes/${codeType.code.toLowerCase()}`)
        .set('Authorization', `Bearer ${adminToken}`)
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

    fit('Should throw an error when code type is not found', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes/unknownType`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    fit('Should throw an error when userId in jwt is not found', async () => {
      const invalidToken = await getValidJwt(faker.random.uuid());
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes/${codeType.code.toLowerCase()}`)
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    fit('Should throw an error without admin permission', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes/${codeType.code.toLowerCase()}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.UNAUTHORIZED.code);
      expect(body.errors[0].title).toEqual(errors.UNAUTHORIZED.message);
    });

    fit('Should throw an error without jwt token provided', async () => {
      const { body, status } = await request(app)
        .get(`${prefix}/meta/codes/${codeType.code.toLowerCase()}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
      expect(body.errors[0].code).toEqual(errors.UNAUTHORIZED.code);
      expect(body.errors[0].title).toEqual(errors.UNAUTHORIZED.message);
    });
  });
});
