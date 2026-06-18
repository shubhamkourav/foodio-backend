import { Redis } from 'ioredis';

import { env } from './env.js';
import { logger } from './logger.js';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    redis.on('error', (err: Error) => {
      logger.warn(`Redis connection error: ${err.message}`);
    });

    redis.on('connect', () => {
      logger.info('Redis connected');
    });
  }

  return redis;
}

export async function connectRedis(): Promise<void> {
  const client = getRedis();

  if (client.status === 'wait' || client.status === 'end') {
    await client.connect();
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
