import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { upload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import menuRoutes from '../menu/menu.routes.js';
import * as restaurantController from './restaurant.controller.js';
import {
  createRestaurantSchema,
  listRestaurantsSchema,
  restaurantIdSchema,
  updateRestaurantSchema,
} from './restaurant.schema.js';

const router = Router();

router.get('/', validate({ query: listRestaurantsSchema }), restaurantController.listRestaurants);
router.get('/:id/menu', validate({ params: restaurantIdSchema }), restaurantController.getRestaurantMenu);
router.get('/:id', validate({ params: restaurantIdSchema }), restaurantController.getRestaurant);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createRestaurantSchema }),
  restaurantController.createRestaurant,
);

router.patch(
  '/:id',
  authenticate,
  validate({ params: restaurantIdSchema, body: updateRestaurantSchema }),
  restaurantController.updateRestaurant,
);

router.post(
  '/:id/images/cover',
  authenticate,
  upload.single('image'),
  validate({ params: restaurantIdSchema }),
  restaurantController.uploadCover,
);

router.post(
  '/:id/images/logo',
  authenticate,
  upload.single('image'),
  validate({ params: restaurantIdSchema }),
  restaurantController.uploadLogo,
);

router.use('/:restaurantId/menu', menuRoutes);

export default router;
