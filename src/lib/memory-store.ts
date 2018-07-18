import * as redis from 'redis';

let redisClient;

const options: redis.ClientOpts = {
  url: process.env.REDISCLOUD_URL,
};

/**
 * Make sure we return the same instance
 * Don't create the instance on startup (not needed in all environments)
 */
export function getRedisClient() {
  if (!redisClient) redisClient = redis.createClient(options);
  return redisClient;
}
