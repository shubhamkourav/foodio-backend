import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import * as authController from './auth.controller.js';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from './auth.schema.js';

const router = Router();

router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/verify-otp', validate({ body: verifyOtpSchema }), authController.verifyOtp);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/refresh', validate({ body: refreshSchema }), authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', validate({ body: resetPasswordSchema }), authController.resetPassword);

export default router;
