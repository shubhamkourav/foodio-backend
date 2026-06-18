import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getParam } from '../../utils/getParam.js';
import { requireAuth } from '../../utils/requireAuth.js';
import { requireUploadedFile } from '../../utils/cloudinaryUpload.js';
import { menuService } from './menu.service.js';

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const data = await menuService.listCategories(getParam(req.params.restaurantId));
  res.json(ApiResponse.ok(data, 'Categories fetched').toJSON());
});

export const listItems = asyncHandler(async (req: Request, res: Response) => {
  const { items, pagination } = await menuService.listItems(
    getParam(req.params.restaurantId),
    req.query as Record<string, unknown>,
  );
  res.json(ApiResponse.paginated(items, pagination, 'Menu items fetched').toJSON());
});

export const getItem = asyncHandler(async (req: Request, res: Response) => {
  const data = await menuService.getItem(
    getParam(req.params.restaurantId),
    getParam(req.params.itemId),
  );
  res.json(ApiResponse.ok(data, 'Menu item fetched').toJSON());
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await menuService.createCategory(
    getParam(req.params.restaurantId),
    user.id,
    user.role,
    req.body,
  );
  res.status(201).json(ApiResponse.ok(data, 'Category created', 201).toJSON());
});

export const createItem = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await menuService.createItem(
    getParam(req.params.restaurantId),
    user.id,
    user.role,
    req.body,
  );
  res.status(201).json(ApiResponse.ok(data, 'Menu item created', 201).toJSON());
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await menuService.updateItem(
    getParam(req.params.restaurantId),
    getParam(req.params.itemId),
    user.id,
    user.role,
    req.body,
  );
  res.json(ApiResponse.ok(data, 'Menu item updated').toJSON());
});

export const deleteItem = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await menuService.deleteItem(
    getParam(req.params.restaurantId),
    getParam(req.params.itemId),
    user.id,
    user.role,
  );
  res.json(ApiResponse.ok(data, 'Menu item deleted').toJSON());
});

export const uploadItemImage = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const file = requireUploadedFile(req);
  const data = await menuService.uploadItemImage(
    getParam(req.params.restaurantId),
    getParam(req.params.itemId),
    user.id,
    user.role,
    file,
  );
  res.json(ApiResponse.ok(data, 'Menu item image updated').toJSON());
});
