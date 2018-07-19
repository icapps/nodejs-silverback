import { logger } from '../../src/lib/logger';
import * as mailer from '../../src/lib/mailer';
import { initForgotPw } from '../../src/services/auth.service';
import { clearAll } from '../_helpers/mockdata/data';
import { createUser, findById, validUser } from '../_helpers/mockdata/user.data';

describe('authService', () => {
  const prefix = `/api/${process.env.API_VERSION}`;
  let user;

  beforeAll(async () => {
    await clearAll();
    user = await createUser(validUser, 'registered');
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
});
