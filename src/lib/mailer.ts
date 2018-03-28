import * as mandrill from 'mandrill-api';
import { logger } from './logger';
import { MailClient, MailOptions, TemplateMailOptions } from '../models/mail.model';

/**
 * Return a default MailClient (Mandrill in this case)
 */
export function getDefaultClient() {
  if (!process.env.MANDRILL_API_KEY) throw new Error('No Mandrill api key provided');
  return new mandrill.Mandrill(process.env.MANDRILL_API_KEY, process.env.LOG_LEVEL === 'debug');
}


/**
 * Send an email with html or text
 */
export async function send(options: MailOptions, client: MailClient) {
  return new Promise((resolve, reject) => {
    client.messages.send(options, (result) => {
      logger.info(`Message sent: ${result}`);
      resolve();
    }, (error) => {
      logger.error(`Error trying to send an email: ${error.message}`);
      reject(error);
    });
  });
}


/**
 * Send an email with a template from Mandrill/Mailchimp provided
 */
export async function sendTemplate(options: TemplateMailOptions, client: MailClient) {
  return new Promise((resolve, reject) => {
    client.messages.sendTemplate(options, (result) => {
      logger.info(`Message sent: ${JSON.stringify(result)}`);
      resolve();
    }, (error) => {
      logger.error(`Error trying to send an email: ${error.message}`);
      reject(error);
    });
  });
}
