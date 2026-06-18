import type { Request } from 'express';

import { cloudinary, configureCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { logger } from '../config/logger.js';
import { ApiError } from './ApiError.js';

export const UPLOAD_FOLDERS = {
  avatars: 'foodio/avatars',
  restaurantCovers: 'foodio/restaurants/covers',
  restaurantLogos: 'foodio/restaurants/logos',
  menuItems: 'foodio/menu/items',
} as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS];

export function requireUploadedFile(req: Request): Express.Multer.File {
  if (!req.file) {
    throw new ApiError(400, 'No image file provided');
  }

  return req.file;
}

export async function uploadImageToCloudinary(
  file: Express.Multer.File,
  folder: UploadFolder,
): Promise<{ url: string; publicId: string }> {
  configureCloudinary();

  if (!isCloudinaryConfigured()) {
    throw new ApiError(503, 'Image upload is not configured');
  }

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });

    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    logger.error('Cloudinary upload failed', error);
    throw new ApiError(502, 'Failed to upload image');
  }
}
