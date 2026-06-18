import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { promoService } from './promo.service.js';

export const listPromos = asyncHandler(async (_req: Request, res: Response) => {
  const data = await promoService.listActive();
  res.json(ApiResponse.ok(data, 'Promotions fetched').toJSON());
});

export const validatePromo = asyncHandler(async (req: Request, res: Response) => {
  const data = await promoService.validate(req.body.code, req.body.subtotal);
  res.json(ApiResponse.ok(data, 'Promo validated').toJSON());
});

export const createPromo = asyncHandler(async (req: Request, res: Response) => {
  const data = await promoService.create(req.body);
  res.status(201).json(ApiResponse.ok(data, 'Promotion created', 201).toJSON());
});
