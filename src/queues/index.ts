import { logger } from '../config/logger.js';

export async function startWorkers(): Promise<void> {
  try {
    const { startEmailWorker } = await import('../jobs/emailWorker.js');
    const { startOrderTimeoutWorker } = await import('../jobs/orderTimeoutWorker.js');
    startEmailWorker();
    startOrderTimeoutWorker();
    logger.info('Background workers started');
  } catch (error) {
    logger.warn('Background workers not started (Redis may be unavailable)', error);
  }
}
