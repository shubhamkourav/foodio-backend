import type { Request, Response, NextFunction, RequestHandler } from 'express';

import { getRedis } from '../config/redis.js';
import { ApiError } from '../utils/ApiError.js';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;
const PREFIX = 'rate:';

interface MemoryEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryEntry>();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];

  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
  }

  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0];
  }

  return req.ip ?? 'unknown';
}

async function checkRedisLimit(key: string): Promise<{ allowed: boolean; remaining: number }> {
  const redis = getRedis();
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.pexpire(key, WINDOW_MS);
  }

  return {
    allowed: count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - count),
  };
}

function checkMemoryLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now >= entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  entry.count += 1;

  return {
    allowed: entry.count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - entry.count),
  };
}

function setRateLimitHeaders(res: Response, remaining: number): void {
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', remaining);
}

export const rateLimiter: RequestHandler = async (req, res, next) => {
  const ip = getClientIp(req);
  const key = `${PREFIX}${ip}`;

  try {
    const redis = getRedis();

    if (redis.status === 'ready' || redis.status === 'connect') {
      const { allowed, remaining } = await checkRedisLimit(key);
      setRateLimitHeaders(res, remaining);

      if (!allowed) {
        next(new ApiError(429, 'Too many requests, please try again later'));
        return;
      }

      next();
      return;
    }
  } catch {
    // Fall back to in-memory rate limiting when Redis is unavailable.
  }

  const { allowed, remaining } = checkMemoryLimit(key);
  setRateLimitHeaders(res, remaining);

  if (!allowed) {
    next(new ApiError(429, 'Too many requests, please try again later'));
    return;
  }

  next();
};
