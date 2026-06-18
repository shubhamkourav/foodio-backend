import { Worker } from 'bullmq';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { Order } from '../modules/orders/order.model.js';
import { emitOrderStatusUpdated } from '../sockets/emitter.js';

export function startOrderTimeoutWorker(): Worker {
  const worker = new Worker(
    'order-timeout',
    async (job) => {
      const { orderId } = job.data as { orderId: string };
      const order = await Order.findById(orderId);

      if (order && order.status === 'pending_payment') {
        order.status = 'cancelled';
        await order.save();
        emitOrderStatusUpdated(orderId, 'cancelled');
        logger.info(`Order ${orderId} auto-cancelled due to payment timeout`);
      }
    },
    { connection: { url: env.REDIS_URL } },
  );

  return worker;
}
