import { Order } from '../orders/order.model.js';
import { Restaurant } from '../restaurants/restaurant.model.js';
import { Review } from './review.model.js';
import { assertCondition, assertFound, ensureFound } from '../../utils/assertions.js';
import { buildPagination, parsePageLimit } from '../../utils/pagination.js';
import { runService } from '../../utils/runService.js';

export const reviewService = {
  async createReview(
    userId: string,
    data: { orderId: string; rating: number; comment: string },
  ) {
    return runService('review.createReview', async () => {
      const order = ensureFound(
        await Order.findOne({ _id: data.orderId, user: userId }),
        'Order not found',
      );

      assertCondition(order.status === 'delivered', 400, 'Can only review delivered orders');

      const existing = await Review.findOne({ order: data.orderId });
      assertCondition(!existing, 409, 'Review already submitted');

      const review = await Review.create({
        user: userId,
        restaurant: order.restaurant,
        order: data.orderId,
        rating: data.rating,
        comment: data.comment,
      });

      const stats = await Review.aggregate([
        { $match: { restaurant: order.restaurant } },
        {
          $group: {
            _id: '$restaurant',
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]);

      if (stats[0]) {
        await Restaurant.findByIdAndUpdate(order.restaurant, {
          rating: Math.round(stats[0].avgRating * 10) / 10,
          reviewCount: stats[0].count,
        });
      }

      return {
        id: review._id.toString(),
        rating: review.rating,
        comment: review.comment,
      };
    });
  },

  async getRestaurantReviews(restaurantId: string, query: Record<string, unknown>) {
    return runService('review.getRestaurantReviews', async () => {
      const restaurant = await Restaurant.findOne({ _id: restaurantId, isActive: true });
      assertFound(restaurant, 'Restaurant not found');

      const { page, limit, skip } = parsePageLimit(query);
      const filter = { restaurant: restaurantId };

      const [reviews, total] = await Promise.all([
        Review.find(filter)
          .populate('user', 'name avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Review.countDocuments(filter),
      ]);

      return {
        items: reviews.map((r) => ({
          id: r._id.toString(),
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          user: r.user,
        })),
        pagination: buildPagination(page, limit, total),
      };
    });
  },
};
