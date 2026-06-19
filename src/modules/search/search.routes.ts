import { Router } from 'express';

import { validate } from '../../middleware/validate.js';
import * as searchController from './search.controller.js';
import { searchQuerySchema } from './search.schema.js';

const router = Router();

router.get('/', validate({ query: searchQuerySchema }), searchController.searchRestaurants);

export default router;
