import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getParam } from '../../utils/getParam.js';
import { requireAuth } from '../../utils/requireAuth.js';
import { reviewService } from './review.service.js';

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await reviewService.createReview(user.id, req.body);
  res.status(201).json(ApiResponse.ok(data, 'Review submitted', 201).toJSON());
});

export const getRestaurantReviews = asyncHandler(async (req: Request, res: Response) => {
  const { items, pagination } = await reviewService.getRestaurantReviews(
    getParam(req.params.id),
    req.query as Record<string, unknown>,
  );
  res.json(ApiResponse.paginated(items, pagination, 'Reviews fetched').toJSON());
});
