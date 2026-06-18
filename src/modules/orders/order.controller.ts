import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getParam } from '../../utils/getParam.js';
import { requireAuth } from '../../utils/requireAuth.js';
import { orderService } from './order.service.js';

export const placeOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await orderService.placeOrder(user.id, req.body);
  res.status(201).json(ApiResponse.ok(data, 'Order placed', 201).toJSON());
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const { items, pagination } = await orderService.listOrders(
    user.id,
    req.query as Record<string, unknown>,
  );
  res.json(ApiResponse.paginated(items, pagination, 'Orders fetched').toJSON());
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await orderService.getOrder(user.id, getParam(req.params.id), user.role);
  res.json(ApiResponse.ok(data, 'Order fetched').toJSON());
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await orderService.cancelOrder(user.id, getParam(req.params.id));
  res.json(ApiResponse.ok(data, 'Order cancelled').toJSON());
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const data = await orderService.updateStatus(getParam(req.params.id), req.body.status);
  res.json(ApiResponse.ok(data, 'Order status updated').toJSON());
});
