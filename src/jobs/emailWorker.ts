import { Worker } from 'bullmq';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export function startEmailWorker(): Worker {
  const worker = new Worker(
    'email',
    async (job) => {
      logger.info(`Email job processed: ${job.name}`, { data: job.data });
    },
    { connection: { url: env.REDIS_URL } },
  );

  worker.on('failed', (job, err) => {
    logger.error(`Email job failed: ${job?.id}`, err);
  });

  return worker;
}
