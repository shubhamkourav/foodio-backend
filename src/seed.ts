import { runIndiaSeed } from './seed/runIndiaSeed.js';
import { logger } from './config/logger.js';

runIndiaSeed().catch((error) => {
  logger.error('Seed failed', error);
  process.exit(1);
});
