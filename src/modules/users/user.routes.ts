import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { upload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import * as userController from './user.controller.js';
import { addressIdSchema, addressSchema, updateProfileSchema } from './user.schema.js';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', validate({ body: updateProfileSchema }), userController.updateMe);
router.post('/me/avatar', upload.single('avatar'), userController.uploadAvatar);
router.get('/me/addresses', userController.getAddresses);
router.post('/me/addresses', validate({ body: addressSchema }), userController.addAddress);
router.patch(
  '/me/addresses/:id',
  validate({ params: addressIdSchema, body: addressSchema.partial() }),
  userController.updateAddress,
);
router.delete(
  '/me/addresses/:id',
  validate({ params: addressIdSchema }),
  userController.deleteAddress,
);

export default router;
