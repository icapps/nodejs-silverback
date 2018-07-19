import * as redis from 'redis';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';

const sessionRedis = connectRedis(session);
let redisClient;

const options: redis.ClientOpts = {
  url: process.env.REDISCLOUD_URL,
};

/**
 * Make sure we return the same instance
 * Don't create the instance on startup (not needed in all environments)
 */
export function getRedisClient(): redis.RedisClient {
  if (!redisClient) redisClient = redis.createClient(options);
  return redisClient;
}

/**
 * Return a session Redis instance using our existing client
 */
export function getRedisSessionStore(): session.Store {
  return new sessionRedis({ client: getRedisClient() });
}
