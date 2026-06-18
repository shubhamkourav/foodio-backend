import { Router } from 'express';

import * as cuisineController from './cuisine.controller.js';

const router = Router();

router.get('/', cuisineController.listCuisines);

export default router;
