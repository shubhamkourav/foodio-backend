import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { requireAuth } from '../../utils/requireAuth.js';
import { paymentService } from './payment.service.js';

export const createIntent = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await paymentService.createIntent(user.id, req.body.orderId);
  res.json(ApiResponse.ok(data, 'Payment intent created').toJSON());
});

export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string | undefined;
  const data = await paymentService.handleWebhook(req.body as Buffer, signature);
  res.json(data);
});
