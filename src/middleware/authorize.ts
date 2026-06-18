import type { Request, Response, NextFunction, RequestHandler } from 'express';

import { ApiError } from '../utils/ApiError.js';
import type { UserRole } from '../types/models.js';

export function authorize(...roles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ApiError(403, 'Insufficient permissions'));
      return;
    }

    next();
  };
}
