import { getRedisClient } from '../../../src/lib/memory-store';


/**
 * Clear Redis memory store
 */
export async function clearMemoryStore() {
  return new Promise((resolve, reject) => {
    getRedisClient().flushdb((error, succeeded) => {
      if (error) reject(error);
      resolve(succeeded);
    });
  });
}
