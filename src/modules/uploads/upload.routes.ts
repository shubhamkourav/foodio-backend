import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { upload } from '../../middleware/upload.js';
import * as uploadController from './upload.controller.js';

const router = Router();

router.use(authenticate);
router.post('/image', upload.single('image'), uploadController.uploadImage);

export default router;
