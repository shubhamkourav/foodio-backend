import type { Request, Response } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
  UPLOAD_FOLDERS,
  requireUploadedFile,
  uploadImageToCloudinary,
} from '../../utils/cloudinaryUpload.js';
import { ApiError } from '../../utils/ApiError.js';

const uploadFolderSchema = z.enum([
  UPLOAD_FOLDERS.avatars,
  UPLOAD_FOLDERS.restaurantCovers,
  UPLOAD_FOLDERS.restaurantLogos,
  UPLOAD_FOLDERS.menuItems,
]);

function parseUploadFolder(value: unknown) {
  const parsed = uploadFolderSchema.safeParse(value);
  if (!parsed.success) {
    throw new ApiError(400, 'Invalid upload folder');
  }

  return parsed.data;
}

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const file = requireUploadedFile(req);
  const folder = parseUploadFolder(req.body.folder);
  const data = await uploadImageToCloudinary(file, folder);

  res.status(201).json(ApiResponse.ok(data, 'Image uploaded', 201).toJSON());
});
