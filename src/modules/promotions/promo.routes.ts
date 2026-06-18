import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as promoController from './promo.controller.js';
import { createPromoSchema, validatePromoSchema } from './promo.schema.js';

const router = Router();

router.get('/', promoController.listPromos);
router.post(
  '/validate',
  authenticate,
  validate({ body: validatePromoSchema }),
  promoController.validatePromo,
);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createPromoSchema }),
  promoController.createPromo,
);

export default router;
