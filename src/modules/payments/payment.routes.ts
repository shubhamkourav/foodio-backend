import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import * as paymentController from './payment.controller.js';
import { createIntentSchema } from './payment.schema.js';

const router = Router();

router.post(
  '/create-intent',
  authenticate,
  validate({ body: createIntentSchema }),
  paymentController.createIntent,
);

export default router;
