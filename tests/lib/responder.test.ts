import * as httpStatus from 'http-status';
import * as httpMocks from 'node-mocks-http';
import { BadRequestError, errors } from 'tree-house-errors';
import { Serializer } from 'jsonade';
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
      const res = httpMocks.createResponse();
      const error = new BadRequestError(errors.INVALID_INPUT);

      responder.error(res, error);
      expect(res.statusCode).toEqual(httpStatus.BAD_REQUEST);
      expect(res._isJSON()).toEqual(true);
      expect(JSON.parse(res._getData())).toMatchObject({
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
  });
});
