import * as mailer from '../../src/lib/mailer';
import { clearAll } from '../_helpers/mockdata/data';
import { findById, regularUser, createUserStatuses } from '../_helpers/mockdata/user.data';
import { create } from '../../src/services/user.service';
import { logger } from '../../src/lib/logger';

describe('userService', () => {
  const prefix = `/api/${process.env.API_VERSION}`;

  beforeAll(async () => {
    await clearAll();
    await createUserStatuses();
  });

  afterAll(async () => {
    await clearAll();
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mailSpy = jest.spyOn(mailer, 'sendTemplate').mockImplementation(() => Promise.resolve());

    afterEach(() => {
      mailSpy.mockClear();
    });

    it('Should succesfully send an email to set initial password and update reset token', async () => {
      const user = await create(Object.assign({}, regularUser, { email: 'forgotPw@tester.com', status: 'REGISTERED' }), true);
      expect(mailSpy).toHaveBeenCalledTimes(1);

      const updated = await findById(user.id);
      expect(updated.resetPwToken).not.toBeUndefined();
    });

    it('Should succesfully create a user without being able to set initial password', async () => {
      const user = await create(Object.assign({}, regularUser, { email: 'forgotPw@tester12.com', status: 'REGISTERED' }), false);
      expect(mailSpy).toHaveBeenCalledTimes(0);

      const updated = await findById(user.id);
      expect(updated.resetPwToken).toEqual(null);
    });
  });
});
