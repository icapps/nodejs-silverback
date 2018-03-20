import { UnauthorizedError } from 'tree-house-errors';
import * as httpMocks from 'node-mocks-http';
import { roles } from '../../src/config/roles.config';
import * as utils from '../../src/lib/utils';

describe('lib/utils', () => {
  describe('hasRole', () => {
    it('Should return true when the user has the correct role', () => {
      const user = {
        role: roles.ADMIN.code,
      };
      const hasRole = utils.hasRole(user, roles.ADMIN);
      expect(hasRole).toEqual(true);
    });

    it('Should return true when the user has a higher role than required', () => {
      const user = {
        role: roles.SUPERUSER.code,
      };
      const hasRole = utils.hasRole(user, roles.ADMIN);
      expect(hasRole).toEqual(true);
    });

    it('Should return false when the user has a lower role than required', () => {
      const user = {
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
        expect(err).toEqual(new UnauthorizedError());
      }
    });
  });
});
