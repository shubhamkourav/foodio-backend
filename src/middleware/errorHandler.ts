import type { Request, Response, NextFunction } from 'express';

import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { mapError } from '../utils/mapError.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const apiError = mapError(err);

  if (apiError.statusCode >= 500) {
    logger.error(apiError.message, {
      err:
        err instanceof Error
          ? { name: err.name, message: err.message, stack: err.stack }
          : err,
    });
  } else if (env.NODE_ENV !== 'production') {
    logger.warn(apiError.message, { statusCode: apiError.statusCode, errors: apiError.errors });
  }

  res.status(apiError.statusCode).json({
    success: false,
    statusCode: apiError.statusCode,
    message: apiError.message,
    data: null,
    errors: apiError.errors,
  });
}
