import * as mailer from '../../src/lib/mailer';

describe('lib/mailer', () => {
  const mailMockClient = {
    messages: {
      send: jest.fn(),
      sendTemplate: jest.fn(),
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefaultClient', () => {
    it('Should return a Mandrill instance', () => {
      const client = mailer.getDefaultClient();
      expect(client).toHaveProperty('messages');
      expect(client.messages).toHaveProperty('send');
      expect(client.messages).toHaveProperty('sendTemplate');
      expect(client.messages.send).toBeInstanceOf(Function);
      expect(client.messages.sendTemplate).toBeInstanceOf(Function);
    });
  });

  describe('send', () => {
    it('Should succesfully send mail', async () => {
      mailMockClient.messages.send.mockImplementation((options, cb, errorCb) => cb('Success'));

      const options = {
        message: {
          to: [{ email: 'brent.vangeertruy@icapps.com' }],
          from_email: 'info@icapps.com',
          subject: 'testSubject',
          text: 'testData',
        },
      };

      const response = await mailer.send(options, mailMockClient);
      expect(mailMockClient.messages.send).toHaveBeenCalledTimes(1);
    });

    it('Should catch error when mailer returns error', async () => {
      mailMockClient.messages.send.mockImplementation((options, cb, errorCb) => errorCb(new Error('Invalid recipient')));

      const options = {
        message: {
          to: [{ email: 'brent.vangeertruy@icapps.com' }],
          from_email: 'info@icapps.com',
          subject: 'testSubject',
          text: 'testData',
        },
      };

      expect.assertions(2);
      try {
        const response = await mailer.send(options, mailMockClient);
      } catch (err) {
        expect(err).toEqual(new Error('Invalid recipient'));
        expect(mailMockClient.messages.send).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('sendTemplate', () => {
    it('Should succesfully send mail via template', async () => {
      mailMockClient.messages.sendTemplate.mockImplementation((options, cb, errorCb) => cb('Success'));

      const options = {
        template_name: 'My template',
        message: {
          to: [{ email: 'brent.vangeertruy@icapps.com' }],
          from_email: 'info@icapps.com',
          subject: 'testSubject',
          text: 'testData',
        },
      };

      const response = await mailer.sendTemplate(options, mailMockClient);
      expect(mailMockClient.messages.sendTemplate).toHaveBeenCalledTimes(1);
    });

    it('Should catch error when mailer returns error', async () => {
      mailMockClient.messages.sendTemplate.mockImplementation((options, cb, errorCb) => errorCb(new Error('Invalid recipient')));

      const options = {
        template_name: 'My template',
        message: {
          to: [{ email: 'brent.vangeertruy@icapps.com' }],
          from_email: 'info@icapps.com',
          subject: 'testSubject',
          text: 'testData',
        },
      };

      expect.assertions(2);
      try {
        const response = await mailer.sendTemplate(options, mailMockClient);
      } catch (err) {
        expect(err).toEqual(new Error('Invalid recipient'));
        expect(mailMockClient.messages.sendTemplate).toHaveBeenCalledTimes(1);
      }
    });
  });
});
