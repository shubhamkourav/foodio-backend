import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { cuisineService } from './cuisine.service.js';

export const listCuisines = asyncHandler(async (_req: Request, res: Response) => {
  const data = await cuisineService.listActive();
  res.json(ApiResponse.ok(data, 'Cuisines fetched').toJSON());
});
