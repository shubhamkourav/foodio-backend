import { Order } from '../orders/order.model.js';
import { getStripe } from '../../config/stripe.js';
import { ApiError } from '../../utils/ApiError.js';
import { assertCondition, ensureFound } from '../../utils/assertions.js';
import { runService } from '../../utils/runService.js';
import { emitEtaUpdated, emitOrderStatusUpdated } from '../../sockets/emitter.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

export const paymentService = {
  async createIntent(userId: string, orderId: string) {
    return runService('payment.createIntent', async () => {
      const order = ensureFound(
        await Order.findOne({ _id: orderId, user: userId }),
        'Order not found',
      );

      assertCondition(order.paymentMethod === 'card', 400, 'Order is not configured for card payment');
      assertCondition(
        ['pending_payment', 'confirmed'].includes(order.status),
        400,
        'Payment cannot be created for this order status',
      );

      const stripe = getStripe();
      if (!stripe) throw new ApiError(503, 'Stripe is not configured');

      try {
        const intent = await stripe.paymentIntents.create({
          amount: Math.round(order.total * 100),
          currency: 'usd',
          metadata: { orderId: order._id.toString() },
        });

        order.stripePaymentIntentId = intent.id;
        await order.save();

        return {
          clientSecret: intent.client_secret,
          paymentIntentId: intent.id,
        };
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(502, 'Payment processing failed');
      }
    });
  },

  async handleWebhook(rawBody: Buffer, signature: string | undefined) {
    return runService('payment.handleWebhook', async () => {
      const stripe = getStripe();
      if (!stripe) throw new ApiError(503, 'Stripe is not configured');

      if (!env.STRIPE_WEBHOOK_SECRET) {
        throw new ApiError(503, 'Stripe webhook secret not configured');
      }

      if (!signature) throw new ApiError(400, 'Missing stripe-signature header');

      let event;
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
      } catch {
        throw new ApiError(400, 'Invalid Stripe webhook signature');
      }

      if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object;
        const orderId = intent.metadata?.orderId;

        if (orderId) {
          const order = await Order.findById(orderId);
          if (order) {
            order.paymentStatus = 'paid';
            order.status = 'confirmed';
            await order.save();
            emitOrderStatusUpdated(orderId, 'confirmed');
            if (order.estimatedDeliveryMinutes) {
              emitEtaUpdated(orderId, order.estimatedDeliveryMinutes);
            }
          }
        }
      }

      logger.info(`Stripe webhook received: ${event.type}`);
      return { received: true };
    });
  },
};
