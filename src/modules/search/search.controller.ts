import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { searchService } from './search.service.js';

export const searchRestaurants = asyncHandler(async (req: Request, res: Response) => {
  const { items, pagination } = await searchService.search(req.query as Record<string, unknown>);
  res.json(ApiResponse.paginated(items, pagination, 'Search results fetched').toJSON());
});
