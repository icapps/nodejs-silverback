import { createTransport, Transporter, SendMailOptions } from 'nodemailer';
import { logger } from './logger';

const defaultTransport: Transporter = createTransport({
  service: 'Mandrill',
  auth: {
    user: process.env.MANDRILL_USERNAME || 'iCapps',
    pass: process.env.MANDRILL_API_KEY,
  },
  logger: process.env.LOG_LEVEL === 'debug', // log to console
  debug: process.env.LOG_LEVEL === 'debug', // include SMTP traffic in the logs
});


/**
 * Send an email with all available nodemailer options
 */
export async function send(options: SendMailOptions, transport: Transporter = defaultTransport): Promise<void> {
  try {
    const info = await transport.sendMail(options);
    logger.info(`Message sent: ${info ? info.response : ''}`);
  } catch (error) {
    logger.error(`Error trying to send an email: ${error.message}`);
    throw error;
  }
}
