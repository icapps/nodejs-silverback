import * as httpStatus from 'http-status';
import { Response } from 'express';
import { parseErrors } from 'tree-house-errors';
import { ErrorSerializer } from 'jsonade';
import { logger } from '../lib/logger';

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
  error: (res: Response, errors: any) => {
    logger.debug('Error:', errors);
    const parsedError = parseErrors(errors);

    if (process.env.NODE_ENV === 'production') Object.assign(parsedError, { meta: undefined }); // Do not send stacktrace in production
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
