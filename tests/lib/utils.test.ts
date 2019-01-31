import * as httpMocks from 'node-mocks-http';
import * as httpStatus from 'http-status';
import { UnauthorizedError } from 'tree-house-errors';
import { errors } from '../../src/config/errors.config';
import { roles } from '../../src/config/roles.config';
import * as utils from '../../src/lib/utils';
import { User } from '../../src/models/user.model';

describe('lib/utils', () => {
  describe('hasRole', () => {
    it('Should return true when the user has the correct role', () => {
      const user = <User>{
        role: roles.ADMIN,
      };
      const hasRole = utils.hasRole(user, roles.ADMIN);
      expect(hasRole).toEqual(true);
    });

    it('Should return true when the user has a higher role than required', () => {
      const user = <User>{
        role: roles.SUPERUSER,
      };
      const hasRole = utils.hasRole(user, roles.ADMIN);
      expect(hasRole).toEqual(true);
    });

    it('Should return false when the user has a lower role than required', () => {
      const user = <User>{
        role: roles.USER,
      };
      const hasRole = utils.hasRole(user, roles.ADMIN);
      expect(hasRole).toEqual(false);
    });
  });

  describe('extractJwt', () => {
    it('Should throw an error when incorrect prefix is provided', () => {
      expect.assertions(1);
      try {
        const mockRequest = httpMocks.createRequest({
          headers: { Authorization: 'JWT ...' },
        });
        utils.extractJwt(mockRequest);
      } catch (err) {
        expect(err).toEqual(new UnauthorizedError(errors.MISSING_HEADERS));
      }
    });

    it('Should throw an error when no headers are present', () => {
      expect.assertions(2);
      try {
        const mockRequest = httpMocks.createRequest({
          headers: {},
        });
        utils.extractJwt(mockRequest);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(err.message).toEqual('Not all required headers are provided');
      }
    });
  });

  describe('checkStatus', () => {
    it('Should not throw any error when the user is ACTIVE and registration confirmed', () => {
      const user: User = {
        email: 'ben.vanraemdonck@icapps.com',
        firstName: 'Ben',
        lastName: 'Van Raemdonck',
        password: 'secret',
        role: {
          name: 'name',
          code: 'code',
          level: 1,
        },
        status: {
          code: 'ACTIVE',
          name: 'status',
        },
        registrationConfirmed: true,
        createdAt: '',
        createdBy: '',
      };

      // TODO: check how to test void function
      utils.checkStatus(user);

    });

    it('Should throw an error when user is INACTIVE', () => {
      const user: User = {
        email: 'ben.vanraemdonck@icapps.com',
        firstName: 'Ben',
        lastName: 'Van Raemdonck',
        password: 'secret',
        role: {
          name: 'name',
          code: 'code',
          level: 1,
        },
        status: {
          code: 'INACTIVE',
          name: 'status',
        },
        registrationConfirmed: true,
        createdAt: '',
        createdBy: '',
      };

      try {
        utils.checkStatus(user);
      } catch (error) {
        expect(error.status).toEqual(httpStatus.UNAUTHORIZED);
        expect(error.code).toEqual(errors.USER_INACTIVE.code);
        expect(error.message).toEqual(errors.USER_INACTIVE.message);
      }
    });

    it('Should throw an error when user registration is not confirmed', () => {
      const user: User = {
        email: 'ben.vanraemdonck@icapps.com',
        firstName: 'Ben',
        lastName: 'Van Raemdonck',
        password: 'secret',
        role: {
          name: 'name',
          code: 'code',
          level: 1,
        },
        status: {
          code: 'ACTIVE',
          name: 'status',
        },
        registrationConfirmed: false,
        createdAt: '',
        createdBy: '',
      };

      try {
        utils.checkStatus(user);
      } catch (error) {
        expect(error.status).toEqual(httpStatus.UNAUTHORIZED);
        expect(error.code).toEqual(errors.USER_UNCONFIRMED.code);
        expect(error.message).toEqual(errors.USER_UNCONFIRMED.message);
      }
    });
  });
});
