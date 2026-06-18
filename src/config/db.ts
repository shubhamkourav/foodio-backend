import mongoose from 'mongoose';

import { env } from './env.js';
import { logger } from './logger.js';

export async function connectDb(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(env.MONGO_URI);
  logger.info('Connected to MongoDB');
}
