import * as httpMocks from 'node-mocks-http';
import { UnauthorizedError } from 'tree-house-errors';
import { errors } from '../../src/config/errors.config';
import { roles } from '../../src/config/roles.config';
import { User } from '../../src/models/user.model';
import * as utils from '../../src/lib/utils';

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
  });


  describe('snakeCaseArray', () => {
    it('Should snake_case strings inside array', () => {
      const result = utils.snakeCaseArray(['valueOne', 'valueTwo']);
      expect(result).toEqual(['\"value_one\"', '\"value_two\"']);
    });

    it('Should snake_case strings inside array with dot notation v1', () => {
      const result = utils.snakeCaseArray(['valueOne.two', 'valueTwo.three']);
      expect(result).toEqual(['\"value_one\".\"two\"', '\"value_two\".\"three\"']);
    });

    it('Should snake_case strings inside array with dot notation v2', () => {
      const result = utils.snakeCaseArray(['valueOne.twoThree', 'valueTwo.threeFour']);
      expect(result).toEqual(['\"value_one\".\"two_three\"', '\"value_two\".\"three_four\"']);
    });

    it('Should snake_case strings inside array with dot notation v3', () => {
      const result = utils.snakeCaseArray(['valueOne.twoThree.four', 'valueTwo.threeFour.five']);
      expect(result).toEqual(['\"value_one\".\"two_three\".\"four\"', '\"value_two\".\"three_four\".\"five\"']);
    });

    it('Should snake_case strings inside array with dot notation v4', () => {
      const result = utils.snakeCaseArray(['valueOne', 'valueTwo.threeFour.five']);
      expect(result).toEqual(['\"value_one\"', '\"value_two\".\"three_four\".\"five\"']);
    });

    it('Should snake_case strings inside array with dot notation v4', () => {
      const result = utils.snakeCaseArray(['valueOne', 'valueTwo.threeFour.five']);
      expect(result).toEqual(['\"value_one\"', '\"value_two\".\"three_four\".\"five\"']);
    });

  });
});
