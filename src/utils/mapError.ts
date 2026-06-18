import mongoose from 'mongoose';
import { MulterError } from 'multer';

import { ApiError } from './ApiError.js';

function isMongoDuplicateKeyError(error: unknown): error is { code: number; keyValue?: Record<string, unknown> } {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000;
}

function isMongoServerError(error: unknown): error is { code?: number; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string' &&
    ('code' in error || error.constructor?.name === 'MongoServerError')
  );
}

export function mapError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return new ApiError(400, 'Image must be 5 MB or smaller');
    }

    return new ApiError(400, error.message);
  }

  if (error instanceof mongoose.Error.CastError) {
    return new ApiError(400, 'Invalid id format');
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((issue) => issue.message);
    return new ApiError(400, 'Validation failed', errors);
  }

  if (isMongoDuplicateKeyError(error)) {
    const field = error.keyValue ? Object.keys(error.keyValue)[0] : 'field';
    return new ApiError(409, `${field} already exists`);
  }

  if (isMongoServerError(error)) {
    if (error.message.includes('$near') && error.message.includes('skip')) {
      return new ApiError(400, 'Pagination is not supported with location sorting');
    }

    if (error.message.includes('2dsphere') || error.message.includes('$geoNear')) {
      return new ApiError(400, 'Invalid location query');
    }
  }

  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return new ApiError(400, 'Invalid JSON body');
  }

  if (error instanceof Error) {
    if (error.message.includes('Cannot set property query')) {
      return new ApiError(500, 'Request query validation failed');
    }

    if (error.name === 'JsonWebTokenError') {
      return new ApiError(401, 'Invalid token');
    }

    if (error.name === 'TokenExpiredError') {
      return new ApiError(401, 'Token expired');
    }
  }

  return new ApiError(500, 'Internal server error');
}
