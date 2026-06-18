import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { upload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import * as menuController from './menu.controller.js';
import {
  createCategorySchema,
  createMenuItemSchema,
  itemIdParamSchema,
  listMenuItemsSchema,
  restaurantIdParamSchema,
  updateMenuItemSchema,
} from './menu.schema.js';

const router = Router({ mergeParams: true });

router.get(
  '/categories',
  validate({ params: restaurantIdParamSchema }),
  menuController.listCategories,
);

router.get(
  '/items',
  validate({ params: restaurantIdParamSchema, query: listMenuItemsSchema }),
  menuController.listItems,
);

router.get(
  '/items/:itemId',
  validate({ params: itemIdParamSchema }),
  menuController.getItem,
);

router.post(
  '/categories',
  authenticate,
  validate({ params: restaurantIdParamSchema, body: createCategorySchema }),
  menuController.createCategory,
);

router.post(
  '/items',
  authenticate,
  validate({ params: restaurantIdParamSchema, body: createMenuItemSchema }),
  menuController.createItem,
);

router.patch(
  '/items/:itemId',
  authenticate,
  validate({ params: itemIdParamSchema, body: updateMenuItemSchema }),
  menuController.updateItem,
);

router.post(
  '/items/:itemId/image',
  authenticate,
  upload.single('image'),
  validate({ params: itemIdParamSchema }),
  menuController.uploadItemImage,
);

router.delete(
  '/items/:itemId',
  authenticate,
  validate({ params: itemIdParamSchema }),
  menuController.deleteItem,
);

export default router;
