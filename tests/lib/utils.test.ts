import { UnauthorizedError } from 'tree-house-errors';
import * as httpMocks from 'node-mocks-http';
import { errors } from '../../src/config/errors.config';
import { roles } from '../../src/config/roles.config';
import { User } from '../../src/models/user.model';
import * as utils from '../../src/lib/utils';

describe('lib/utils', () => {
  describe('hasRole', () => {
    it('Should return true when the user has the correct role', () => {
      const user = <User>{
        role: roles.ADMIN.code,
      };
      const hasRole = utils.hasRole(user, roles.ADMIN);
      expect(hasRole).toEqual(true);
    });

    it('Should return true when the user has a higher role than required', () => {
      const user = <User>{
        role: roles.SUPERUSER.code,
      };
      const hasRole = utils.hasRole(user, roles.ADMIN);
      expect(hasRole).toEqual(true);
    });

    it('Should return false when the user has a lower role than required', () => {
      const user = <User>{
        role: roles.USER.code,
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
  });
});
