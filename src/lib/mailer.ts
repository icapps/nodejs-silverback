import * as mandrill from 'mandrill-api';
import { logger } from './logger';


/**
 * Return a default MailClient (Mandrill in this case)
 */
export function getDefaultClient() {
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
      logger.info(`Message sent: ${result}`);
      resolve();
    }, (error) => {
      logger.error(`Error trying to send an email: ${error.message}`);
      reject(error);
    });
  });
}


// Interfaces
export interface MailClient {
  messages: {
    send: Function;
    sendTemplate: Function;
  };
}

export interface MailOptions {
  message: {
    html?: string;
    text?: string;
    subject: string;
    from_email: string;
    from_name?: string;
    to: {
      email: string;
      name?: string;
      type?: 'to'
    }[];
    headers?: {};
    bcc_address?: string;
  };
  async?: boolean;
  send_at?: string;
  ip_pool?: string;
}

export interface TemplateMailOptions extends MailOptions {
  template_name: string;
  template_content?: {
    name: string;
    content: string;
  }[];
}

