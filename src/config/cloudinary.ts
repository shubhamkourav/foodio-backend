import { v2 as cloudinary } from 'cloudinary';

import { env } from './env.js';
import { logger } from './logger.js';

let configured = false;

export function configureCloudinary(): void {
  if (configured) {
    return;
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    logger.warn('Cloudinary credentials not configured');
    return;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  configured = true;
  logger.info('Cloudinary configured');
}

export function isCloudinaryConfigured(): boolean {
  return configured;
}

export { cloudinary };
