import * as winston from 'winston';

export default {
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console({
      colorize: true,
    }),
  ],
};
