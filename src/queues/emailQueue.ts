import { Queue } from 'bullmq';

import { env } from '../config/env.js';

const connection = { url: env.REDIS_URL };

export const emailQueue = new Queue('email', { connection });
export const orderTimeoutQueue = new Queue('order-timeout', { connection });
