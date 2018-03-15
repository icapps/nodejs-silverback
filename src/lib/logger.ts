import * as winston from 'winston';
import config from '../config/logger.config';

// Singleton logger instance
const loggerInstance: winston.LoggerInstance = new winston.Logger(config);

export const logger = {
  info: (message: string, ...args: any[]) => loggerInstance.info(message, args),
  warn: (message: string, ...args: any[]) => loggerInstance.warn(message, args),
  debug: (message: string, ...args: any[]) => loggerInstance.debug(message, args),
  error: (message: string, ...args: any[]) => loggerInstance.error(message, args),
  silly: (message: string, ...args: any[]) => loggerInstance.silly(message, args),
};
