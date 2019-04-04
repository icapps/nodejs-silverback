import * as mailer from '../../src/lib/mailer';
import * as httpStatus from 'http-status';
import { logger } from '../../src/lib/logger';
import { initForgotPw, login } from '../../src/services/auth.service';
import { clearAll } from '../_helpers/mockdata/data';
import { createUser, findById, validUser } from '../_helpers/mockdata/user.data';
import { AuthCredentials } from '../../src/models/auth.model';
import { errors } from '../../src/config/errors.config';

describe('authService', () => {
  let user;

  beforeAll(async () => {
    await clearAll();
    user = await createUser(validUser, 'active');
  });

  afterAll(async () => {
    await clearAll();
    jest.clearAllMocks();
  });

  describe('initForgotPw', () => {
    const mailSpy = jest.spyOn(mailer, 'sendTemplate').mockResolvedValue(null);
    const logSpy = jest.spyOn(logger, 'error');

    it('Should succesfully send a forgot pw email and update reset token', async () => {
      await initForgotPw(user.email);
      expect(mailSpy).toHaveBeenCalledTimes(1);

      const updated = await findById(user.id);
      expect(updated.resetPwToken).not.toBeUndefined();
    });

    it('Should log an internal error when user is not found', async () => {
      await initForgotPw('noKnown@test.com');
      expect(logSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('Should return a JWT token if the given credentials are correct', async () => {
      const credentials: AuthCredentials = {
        email: 'willem.wortel@icapps.com',
        password: 'developer',
      };

      const tokenObject =  await login(credentials, 'jwt');
      expect(tokenObject).toHaveProperty('accessToken');

    });

    it('Should throw an error when the username is correct but the password is not', async () => {
      const credentials: AuthCredentials = {
        email: 'willem.wortel@icapps.com',
        password: 'wrongpassword',
      };
      expect.assertions(3);
      try {
        await login(credentials, 'jwt');
      } catch (error) {
        expect(error.status).toEqual(httpStatus.BAD_REQUEST);
        expect(error.code).toEqual(errors.USER_INVALID_CREDENTIALS.code);
        expect(error.message).toEqual(errors.USER_INVALID_CREDENTIALS.message);
      }
    });

    it('Should throw an error when the user does not exist', async () => {
      const credentials: AuthCredentials = {
        email: 'notexisting@icapps.com',
        password: 'developer',
      };
      expect.assertions(3);
      try {
        await login(credentials, 'jwt');
      } catch (error) {
        expect(error.status).toEqual(httpStatus.BAD_REQUEST);
        expect(error.code).toEqual(errors.USER_INVALID_CREDENTIALS.code);
        expect(error.message).toEqual(errors.USER_INVALID_CREDENTIALS.message);
      }
    });
  });
});
