import { logger } from '../config/logger.js';
import { ApiError } from './ApiError.js';
import { mapError } from './mapError.js';

export async function runService<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    logger.error(`Service operation failed: ${operation}`, {
      error: error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error,
    });

    throw mapError(error);
  }
}
