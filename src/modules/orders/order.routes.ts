import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import * as orderController from './order.controller.js';
import {
  listOrdersSchema,
  orderIdSchema,
  placeOrderSchema,
  updateOrderStatusSchema,
} from './order.schema.js';

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: placeOrderSchema }), orderController.placeOrder);
router.get('/', validate({ query: listOrdersSchema }), orderController.listOrders);
router.get('/:id', validate({ params: orderIdSchema }), orderController.getOrder);
router.patch('/:id/cancel', validate({ params: orderIdSchema }), orderController.cancelOrder);
router.patch(
  '/:id/status',
  authorize('driver', 'admin'),
  validate({ params: orderIdSchema, body: updateOrderStatusSchema }),
  orderController.updateOrderStatus,
);

export default router;
