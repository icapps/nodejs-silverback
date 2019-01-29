import * as httpStatus from 'http-status';
import { Request, Response } from 'express';
import { parseErrors, I18nOptions } from 'tree-house-errors';
import { ErrorSerializer } from 'jsonade';
import { envs, errorTranslations } from '../constants';
import { logger, sentry } from '../lib/logger';

/**
 * ExpressJS responder to send success/error responses
*/
export const responder: { success: Function, error: Function } = {
  success: (res: Response, { status = httpStatus.OK, payload, serializer, totalCount }: ResponderOptions) => {
    if (!payload) return res.sendStatus(status);
    if (!serializer || !serializer.serialize) {
      return res.status(status).send(payload);
    }

    logger.debug('Response: ', serializer.serialize(payload, { totalCount }));
    return res.status(status).json(serializer.serialize(payload, { totalCount }));
  },
  error: (req: Request | any, res: Response, errors: any) => {
    logger.debug('Error:', errors);

    const i18nOptions: I18nOptions = {
      language: req.headers ? (req.headers['accept-language'] || 'en') : 'en',
      path: errorTranslations,
    };
    const parsedError = parseErrors(errors, i18nOptions);

    // Log internal server errors to Sentry
    if (parsedError.status === httpStatus.INTERNAL_SERVER_ERROR) {
      if (req.current && req.current.user) { // errors thrown here will be associated with logged in user
        const { id, email, firstName, lastName } = req.current.user;
        sentry.configureScope((scope) => {
          scope.setUser({ id, email, name: `${firstName} ${lastName}` });
        });
      }
      sentry.captureException(errors);
    }

    if (process.env.NODE_ENV === envs.PRODUCTION) Object.assign(parsedError, { meta: undefined }); // Do not send stacktrace in production
    const serializerError = ErrorSerializer.serialize([parsedError]);

    logger.error('Error response: ', serializerError);
    return res.status(parsedError.status).json(serializerError);
  },
};

// Type definitions
export interface ResponderOptions {
  status?: number;
  payload?: any;
  serializer?: any;
  totalCount?: number;
}
