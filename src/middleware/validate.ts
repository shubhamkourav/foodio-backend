import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { z } from 'zod';

import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { mapError } from '../utils/mapError.js';

type ValidationTarget = 'body' | 'query' | 'params';

type ValidateSchemas = Partial<Record<ValidationTarget, z.ZodType>>;

function isZodSchema(value: unknown): value is z.ZodType {
  return typeof value === 'object' && value !== null && 'safeParse' in value;
}

function applyValidatedData(req: Request, target: ValidationTarget, data: unknown): void {
  switch (target) {
    case 'body':
      req.body = data;
      break;
    case 'query':
      // Express 5 exposes query as a read-only getter — replace it with parsed data.
      Object.defineProperty(req, 'query', {
        value: data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
      break;
    case 'params':
      req.params = data as Request['params'];
      break;
  }
}

function runValidation(
  req: Request,
  schema: z.ZodType,
  target: ValidationTarget,
  next: NextFunction,
): boolean {
  try {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
        return `${path}${issue.message}`;
      });

      next(new ApiError(400, 'Validation failed', errors));
      return false;
    }

    applyValidatedData(req, target, result.data);
    return true;
  } catch (error) {
    logger.error(`Validation middleware failed for ${target}`, { error });
    next(mapError(error));
    return false;
  }
}

export function validate(
  schemaOrSchemas: z.ZodType | ValidateSchemas,
  target: ValidationTarget = 'body',
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (isZodSchema(schemaOrSchemas)) {
        if (!runValidation(req, schemaOrSchemas, target, next)) return;
        next();
        return;
      }

      const schemas = schemaOrSchemas as ValidateSchemas;

      for (const key of ['params', 'query', 'body'] as ValidationTarget[]) {
        const schema = schemas[key];
        if (schema && !runValidation(req, schema, key, next)) return;
      }

      next();
    } catch (error) {
      logger.error('Validation middleware failed', { error });
      next(mapError(error));
    }
  };
}
