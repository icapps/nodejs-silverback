import { getRateLimiter } from 'tree-house';
import { RequestHandler } from 'express';
import { globalBruteConfig, userBruteConfig, userBruteMiddlewareConfig } from '../config/security.config';

/**
 * No more than 1000 login attempts per day per IP
 */
export const setGlobalBruteforce: RequestHandler = getRateLimiter(globalBruteConfig).prevent;

/**
 * Start slowing requests after 5 failed attempts to do something for the same user
 */
export const setUserBruteForce: RequestHandler = getRateLimiter(userBruteConfig)
  .getMiddleware(userBruteMiddlewareConfig);
