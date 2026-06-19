import { Router } from 'express';

import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import restaurantRoutes from '../modules/restaurants/restaurant.routes.js';
import orderRoutes from '../modules/orders/order.routes.js';
import paymentRoutes from '../modules/payments/payment.routes.js';
import reviewRoutes from '../modules/reviews/review.routes.js';
import promoRoutes from '../modules/promotions/promo.routes.js';
import cuisineRoutes from '../modules/cuisines/cuisine.routes.js';
import searchRoutes from '../modules/search/search.routes.js';
import uploadRoutes from '../modules/uploads/upload.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cuisines', cuisineRoutes);
router.use('/search', searchRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/promotions', promoRoutes);
router.use('/uploads', uploadRoutes);

export default router;
