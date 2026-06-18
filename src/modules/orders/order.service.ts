import { Restaurant } from '../restaurants/restaurant.model.js';
import { MenuItem } from '../menu/menuItem.model.js';
import { Order } from './order.model.js';
import { Promo, type IPromo } from '../promotions/promo.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { assertAuthorized, assertCondition, assertFound, ensureFound } from '../../utils/assertions.js';
import { buildPagination, parsePageLimit } from '../../utils/pagination.js';
import { getStripe } from '../../config/stripe.js';
import { runService } from '../../utils/runService.js';
import { emitEtaUpdated, emitOrderStatusUpdated } from '../../sockets/emitter.js';
import {
  estimateDeliveryTime,
  kitchenPrepMinutes,
} from '../../utils/estimateDeliveryTime.js';

function calculatePromoDiscount(subtotal: number, promo: IPromo): number {
  if (subtotal < promo.minOrderAmount) return 0;

  let discount =
    promo.discountType === 'percent'
      ? (subtotal * promo.discountValue) / 100
      : promo.discountValue;

  if (promo.maxDiscount !== undefined) {
    discount = Math.min(discount, promo.maxDiscount);
  }

  return Math.min(discount, subtotal);
}

export const orderService = {
  async placeOrder(
    userId: string,
    input: {
      restaurantId: string;
      items: Array<{
        menuItemId: string;
        quantity: number;
        selectedCustomizations?: Array<{
          groupName: string;
          optionName: string;
          priceModifier: number;
        }>;
      }>;
      deliveryAddress: Record<string, unknown>;
      paymentMethod: 'card' | 'upi' | 'cod';
      promoCode?: string;
    },
  ) {
    return runService('order.placeOrder', async () => {
      assertCondition(input.items.length > 0, 400, 'Order must contain at least one item');

      const restaurant = await Restaurant.findOne({ _id: input.restaurantId, isActive: true });
      assertFound(restaurant, 'Restaurant not found');
      assertCondition(restaurant.isOpen, 400, 'Restaurant is currently closed');

      const orderItems = [];
      let subtotal = 0;

      for (const item of input.items) {
        const menuItem = await MenuItem.findOne({
          _id: item.menuItemId,
          restaurant: input.restaurantId,
          isAvailable: true,
        });
        if (!menuItem) {
          throw new ApiError(404, `Menu item ${item.menuItemId} not found`);
        }

        const customizationTotal = (item.selectedCustomizations ?? []).reduce(
          (sum, c) => sum + c.priceModifier,
          0,
        );
        const unitPrice = menuItem.price + customizationTotal;
        const itemTotal = unitPrice * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          menuItem: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: item.quantity,
          selectedCustomizations: item.selectedCustomizations ?? [],
          itemTotal,
        });
      }

      if (subtotal < restaurant.minOrderAmount) {
        throw new ApiError(400, `Minimum order amount is ${restaurant.minOrderAmount}`);
      }

      let discount = 0;
      let promoCode: string | undefined;

      if (input.promoCode) {
        const promo = await Promo.findByCode(input.promoCode);
        if (!promo) throw new ApiError(400, 'Invalid promo code');
        discount = calculatePromoDiscount(subtotal, promo);
        promoCode = promo.code;
        promo.usedCount += 1;
        await promo.save();
      }

      const deliveryFee = restaurant.deliveryFee;
      const total = subtotal + deliveryFee - discount;

      const [restaurantLng, restaurantLat] = restaurant.location.coordinates;
      const deliveryLat = Number(input.deliveryAddress.lat);
      const deliveryLng = Number(input.deliveryAddress.lng);

      const deliveryEstimate = await estimateDeliveryTime({
        restaurantLat,
        restaurantLng,
        deliveryLat,
        deliveryLng,
        prepTimeMin: kitchenPrepMinutes(restaurant.deliveryTimeMin),
      });

      const estimatedDelivery = deliveryEstimate.estimatedDelivery;
      const estimatedDeliveryMinutes = deliveryEstimate.totalMinutes;

      const initialStatus = input.paymentMethod === 'cod' ? 'confirmed' : 'pending_payment';
      const paymentStatus = input.paymentMethod === 'cod' ? 'pending' : 'pending';

      const order = await Order.create({
        user: userId,
        restaurant: input.restaurantId,
        items: orderItems,
        status: initialStatus,
        deliveryAddress: input.deliveryAddress,
        subtotal,
        deliveryFee,
        discount,
        total,
        paymentMethod: input.paymentMethod,
        paymentStatus,
        promoCode,
        estimatedDelivery,
        estimatedDeliveryMinutes,
      });

      let clientSecret: string | undefined;

      if (input.paymentMethod === 'card') {
        const stripe = getStripe();
        if (stripe) {
          try {
            const intent = await stripe.paymentIntents.create({
              amount: Math.round(total * 100),
              currency: 'usd',
              metadata: { orderId: order._id.toString() },
            });
            order.stripePaymentIntentId = intent.id;
            clientSecret = intent.client_secret ?? undefined;
            await order.save();
          } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(502, 'Payment processing failed');
          }
        }
      }

      if (initialStatus === 'confirmed') {
        emitOrderStatusUpdated(order._id.toString(), initialStatus);
        emitEtaUpdated(order._id.toString(), estimatedDeliveryMinutes);
      }

      return {
        order: {
          id: order._id.toString(),
          status: order.status,
          total: order.total,
          estimatedDelivery: order.estimatedDelivery,
          estimatedDeliveryMinutes: order.estimatedDeliveryMinutes,
        },
        clientSecret,
      };
    });
  },

  async listOrders(userId: string, query: Record<string, unknown>) {
    return runService('order.listOrders', async () => {
      const { page, limit, skip } = parsePageLimit(query);
      const filter = { user: userId };
      const [orders, total] = await Promise.all([
        Order.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('restaurant', 'name coverImage'),
        Order.countDocuments(filter),
      ]);

      return {
        items: orders.map((o) => {
          const restaurant = o.restaurant as { _id?: { toString(): string }; name?: string; coverImage?: string } | null;
          const restaurantId =
            restaurant && typeof restaurant === 'object' && '_id' in restaurant && restaurant._id
              ? restaurant._id.toString()
              : o.restaurant.toString();

          return {
            id: o._id.toString(),
            restaurantId,
            restaurantName: restaurant && 'name' in restaurant ? restaurant.name : undefined,
            restaurantImage: restaurant && 'coverImage' in restaurant ? restaurant.coverImage : undefined,
            itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
            status: o.status,
            total: o.total,
            createdAt: o.createdAt,
            estimatedDelivery: o.estimatedDelivery,
            estimatedDeliveryMinutes: o.estimatedDeliveryMinutes,
          };
        }),
        pagination: buildPagination(page, limit, total),
      };
    });
  },

  async getOrder(userId: string, orderId: string, role: string) {
    return runService('order.getOrder', async () => {
      const order = ensureFound(
        await Order.findById(orderId).populate('restaurant', 'name slug').populate('driver'),
        'Order not found',
      );

      assertAuthorized(
        role !== 'user' || order.user.toString() === userId,
        'Not authorized',
      );

      return order;
    });
  },

  async cancelOrder(userId: string, orderId: string) {
    return runService('order.cancelOrder', async () => {
      const order = ensureFound(
        await Order.findOne({ _id: orderId, user: userId }),
        'Order not found',
      );

      assertCondition(
        ['pending_payment', 'confirmed'].includes(order.status),
        400,
        'Order cannot be cancelled at this stage',
      );

      order.status = 'cancelled';
      await order.save();
      emitOrderStatusUpdated(order._id.toString(), 'cancelled');

      return { id: order._id.toString(), status: order.status };
    });
  },

  async updateStatus(orderId: string, status: string) {
    return runService('order.updateStatus', async () => {
      const order = ensureFound(await Order.findById(orderId), 'Order not found');

      assertCondition(
        !['delivered', 'cancelled'].includes(order.status),
        400,
        `Cannot update order that is already ${order.status}`,
      );

      order.status = status as never;
      if (status === 'delivered') {
        order.paymentStatus = order.paymentMethod === 'cod' ? 'paid' : order.paymentStatus;
      }
      await order.save();

      emitOrderStatusUpdated(order._id.toString(), status);
      return { id: order._id.toString(), status: order.status };
    });
  },
};
