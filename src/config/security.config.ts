import * as httpStatus from 'http-status';
import { RateLimiterOptions } from 'tree-house';
import { InternalServerError, ApiError } from 'tree-house-errors';
import { getRedisClient } from '../lib/memory-store';
import { logger } from '../lib/logger';
import { errors } from './errors.config';
import { envs } from '../constants';

/**
 * Handle a rejected request due to too many requests for example
 */
const failCallback = (req, _res, next, nextTry) => {
  logger.info(`User with email ${req.body.email} has tried to login too many times. Reset time: ${new Date(nextTry).toISOString()}`);
  next(new ApiError(httpStatus.TOO_MANY_REQUESTS, errors.TOO_MANY_REQUESTS));
};

/**
 * Handle a store error that occured with the persistent memory store (Redis)
 */
const handleStoreError = (error) => {
  logger.error(error);
  throw new InternalServerError(errors.INTERNAL_ERROR, { message: error.message });
};

/**
 * No more than 1000 attempts per day per IP
 */
export const globalBruteConfig: RateLimiterOptions = {
  handleStoreError,
  failCallback,
  freeRetries: 1000,
  attachResetToRequest: false,
  refreshTimeoutOnRequest: false,
  minWait: 25 * 60 * 60 * 1000, // 1 day 1 hour (should never reach this wait time)
  maxWait: 25 * 60 * 60 * 1000, // 1 day 1 hour (should never reach this wait time)
  lifetime: 24 * 60 * 60, // 1 day (seconds not milliseconds)
  redis: process.env.NODE_ENV === envs.DEVELOP ? undefined : { client: getRedisClient() }, // Use our existing Redis client (in staging/production)
};

/**
 * Start slowing requests after 5 failed attempts
 */
export const userBruteConfig: RateLimiterOptions = {
  handleStoreError,
  failCallback,
  freeRetries: 5,
  minWait: 5 * 60 * 1000, // 5 minutes
  maxWait: 60 * 60 * 1000, // 1 hour,
  redis: process.env.NODE_ENV === envs.DEVELOP ? undefined : { client: getRedisClient() }, // Use our existing Redis client (in staging/production)
};

/**
 * Check for same key per request (email)
 */
export const userBruteMiddlewareConfig = {
  failCallback,
  ignoreIP: false,
  key: (req, _res, next) => next(req.body.email), // Call per email per ip
};
