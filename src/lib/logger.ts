import * as winston from 'winston';
import * as Raven from 'raven';
import config from '../config/logger.config';

// Singleton logger instance
const instance: winston.Logger = winston.createLogger(config);

export const logger = {
  info: (message: string, ...args: any[]) => instance.info(message, args),
  warn: (message: string, ...args: any[]) => instance.warn(message, args),
  debug: (message: string, ...args: any[]) => instance.debug(message, args),
  error: (message: string, ...args: any[]) => instance.error(message, args),
  silly: (message: string, ...args: any[]) => instance.silly(message, args),
};

export const raven = new Raven.Client();
