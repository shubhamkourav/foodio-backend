import { z } from 'zod';

import { objectIdSchema } from '../../schemas/common.schema.js';

export const createReviewSchema = z.object({
  orderId: objectIdSchema,
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

export const restaurantReviewsSchema = z.object({
  id: objectIdSchema,
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
