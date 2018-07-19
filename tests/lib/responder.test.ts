import * as httpStatus from 'http-status';
import { Serializer } from 'jsonade';
import * as httpMocks from 'node-mocks-http';
import { BadRequestError, errors } from 'tree-house-errors';
import { envs } from '../../src/constants';
import { responder } from '../../src/lib/responder';

describe('lib/responder', () => {
  describe('succes', () => {
    it('Should send response with empty options', () => {
      const res = httpMocks.createResponse();
      responder.success(res, {});

      expect(res.statusCode).toEqual(httpStatus.OK);
      expect(res._isJSON()).toEqual(false);
    });

    it('Should send response without payload', () => {
      const res = httpMocks.createResponse();
      responder.success(res, {
        status: httpStatus.CREATED,
      });

      expect(res.statusCode).toEqual(httpStatus.CREATED);
      expect(res._isJSON()).toEqual(false);
    });

    it('Should send response with payload and without serializer', () => {
      const res = httpMocks.createResponse();
      responder.success(res, {
        status: httpStatus.CREATED,
        payload: 'Brent',
      });

      expect(res.statusCode).toEqual(httpStatus.CREATED);
      expect(res._isJSON()).toEqual(false);
      expect(res._getData()).toEqual('Brent');
    });

    it('Should send response with payload and serializer', () => {
      const res = httpMocks.createResponse();
      const jsonadeSerializer = new Serializer('user', {
        keyForAttribute: 'camelCase',
        attributes: ['name', 'request'],
      });

      responder.success(res, {
        status: httpStatus.CREATED,
        payload: { name: 'Brent' },
        serializer: jsonadeSerializer,
      });

      expect(res.statusCode).toEqual(httpStatus.CREATED);
      expect(res._isJSON()).toEqual(true);
      expect(JSON.parse(res._getData())).toMatchObject({
        meta: {},
        data: {
          name: 'Brent',
        },
      });
    });
  });

  describe('error', () => {
    it('Should return error with matching properties and status code', () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const error = new BadRequestError(errors.INVALID_INPUT);

      responder.error(req, res, error);
      expect(res.statusCode).toEqual(httpStatus.BAD_REQUEST);
      expect(res._isJSON()).toEqual(true);
      expect(JSON.parse(res._getData())).toEqual({
        errors: [{
          id: expect.any(String),
          status: httpStatus.BAD_REQUEST,
          code: errors.INVALID_INPUT.code,
          title: errors.INVALID_INPUT.message,
          detail: errors.INVALID_INPUT.message,
          meta: {
            stack: expect.any(String),
          },
        }],
      });
    });

    it('Should return error without stacktrace in production', () => {
      process.env.NODE_ENV = envs.PRODUCTION;

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const error = new BadRequestError(errors.INVALID_INPUT, { stack: 'MYSTACK' });

      responder.error(req, res, error);
      expect(res.statusCode).toEqual(httpStatus.BAD_REQUEST);
      expect(res._isJSON()).toEqual(true);
      expect(JSON.parse(res._getData())).toEqual({
        errors: [{
          id: expect.any(String),
          status: httpStatus.BAD_REQUEST,
          code: errors.INVALID_INPUT.code,
          title: errors.INVALID_INPUT.message,
          detail: errors.INVALID_INPUT.message,
        }],
      });

      process.env.NODE_ENV = envs.TEST;
    });
  });
});
