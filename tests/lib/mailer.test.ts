import * as nodemailer from 'nodemailer';
import * as stubTransport from 'nodemailer-stub-transport';
import * as mailer from '../../src/lib/mailer';

describe('lib/mailer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('Should succesfully send mail', async () => {
      const transport = nodemailer.createTransport(stubTransport());
      const sendSpy = jest.spyOn(transport, 'sendMail');

      const options = {
        to: 'brent.vangeertruy@icapps.com',
        from: 'info@icapps.com',
        subject: 'testSubject',
        text: 'testData',
      };

      const response = await mailer.send(options, transport);
      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy).toHaveBeenCalledWith(options);
    });

    it('Should catch error when mailer returns error', async () => {
      const transport = nodemailer.createTransport(stubTransport({
        error: 'Invalid recipient',
      }));
      const sendSpy = jest.spyOn(transport, 'sendMail');

      const options = {
        to: 'brent.vangeertruy@icapps.com',
        from: 'info@icapps.com',
        subject: 'testSubject',
        text: 'testData',
      };

      expect.assertions(3);
      try {
        const response = await mailer.send(options, transport);
      } catch (err) {
        expect(err).toEqual(new Error('Invalid recipient'));
      }
      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy).toHaveBeenCalledWith(options);
    });
  });
});
