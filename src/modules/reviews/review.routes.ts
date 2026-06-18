import { Router } from 'express';
import { z } from 'zod';

import { objectIdSchema } from '../../schemas/common.schema.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import * as reviewController from './review.controller.js';
import { createReviewSchema } from './review.schema.js';

const restaurantIdParamSchema = z.object({ id: objectIdSchema });
const listReviewsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

const router = Router();

router.post(
  '/',
  authenticate,
  validate({ body: createReviewSchema }),
  reviewController.createReview,
);

router.get(
  '/restaurant/:id',
  validate({ params: restaurantIdParamSchema, query: listReviewsQuerySchema }),
  reviewController.getRestaurantReviews,
);

export default router;
