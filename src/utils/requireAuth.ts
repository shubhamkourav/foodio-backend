import type { Request } from 'express';

import { ApiError } from './ApiError.js';

export type AuthUser = NonNullable<Request['user']>;

export function requireAuth(req: Request): AuthUser {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  return req.user;
}
