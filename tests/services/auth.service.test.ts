import { logger } from '../../src/lib/logger';
import * as mailer from '../../src/lib/mailer';
import { initForgotPw, login, logout } from '../../src/services/auth.service';
import { clearAll } from '../_helpers/mockdata/data';
import { createUser, findById, validUser } from '../_helpers/mockdata/user.data';
import { AuthCredentials } from '../../src/models/auth.model';

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
    const mailSpy = jest.spyOn(mailer, 'sendTemplate').mockImplementation(() => Promise.resolve());
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
    fit('Should return a JWT token if the given credentials are correct', async () => {
      const credentials: AuthCredentials = {
        email: 'willem.wortel@icapps.com',
        password: 'developer',
      };

      const tokenObject =  await login(credentials, 'jwt');
      console.log(typeof(tokenObject));
      expect(tokenObject).toHaveProperty('accessToken');

    });

    it('Should throw an error when the username is correct but the password is not', async () => {
      const credentials: AuthCredentials = {
        email: 'willem.wortel@icapps.com',
        password: 'wrongpassword',
      };
      expect.assertions(2);
      try {
        await login(credentials, 'jwt');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual('Incorrect username or password. Please try again.');
      }
    });

    it('Should throw an error when the user does not exist', async () => {
      const credentials: AuthCredentials = {
        email: 'notexisting@icapps.com',
        password: 'developer',
      };
      expect.assertions(2);
      try {
        await login(credentials, 'jwt');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual('Incorrect username or password. Please try again.');
      }
    });
  });

  describe('logout', () => {
    it('Should throw an error when it can not destroy the session', async () => {
      // TODO: check if this is a good test...
      const req = {
        // no session
      };
      try {
        await logout(req);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('Should succesfully destroy the session', () => {
      // TODO: implement
    });
  });
/*
  describe('confirmForgotPw', () => {
    it('Should sucesfully ...', () => {

    })
  })
  */
});
