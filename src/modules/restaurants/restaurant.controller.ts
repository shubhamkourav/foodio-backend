import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getParam } from '../../utils/getParam.js';
import { parseOptionalCoords } from '../../utils/parseCoords.js';
import { requireAuth } from '../../utils/requireAuth.js';
import { requireUploadedFile } from '../../utils/cloudinaryUpload.js';
import { restaurantService } from './restaurant.service.js';

export const listRestaurants = asyncHandler(async (req: Request, res: Response) => {
  const { items, pagination } = await restaurantService.list(req.query as Record<string, unknown>);
  res.json(ApiResponse.paginated(items, pagination, 'Restaurants fetched').toJSON());
});

export const getRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng } = parseOptionalCoords(req.query as Record<string, unknown>);
  const data = await restaurantService.getById(getParam(req.params.id), lat, lng);
  res.json(ApiResponse.ok(data, 'Restaurant fetched').toJSON());
});

export const getRestaurantMenu = asyncHandler(async (req: Request, res: Response) => {
  const data = await restaurantService.getMenu(getParam(req.params.id));
  res.json(ApiResponse.ok(data, 'Menu fetched').toJSON());
});

export const createRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await restaurantService.create(user.id, req.body);
  res.status(201).json(ApiResponse.ok(data, 'Restaurant created', 201).toJSON());
});

export const updateRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await restaurantService.update(
    getParam(req.params.id),
    user.id,
    user.role,
    req.body,
  );
  res.json(ApiResponse.ok(data, 'Restaurant updated').toJSON());
});

export const uploadCover = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const file = requireUploadedFile(req);
  const data = await restaurantService.uploadCover(
    getParam(req.params.id),
    user.id,
    user.role,
    file,
  );
  res.json(ApiResponse.ok(data, 'Cover image updated').toJSON());
});

export const uploadLogo = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const file = requireUploadedFile(req);
  const data = await restaurantService.uploadLogo(
    getParam(req.params.id),
    user.id,
    user.role,
    file,
  );
  res.json(ApiResponse.ok(data, 'Logo image updated').toJSON());
});
