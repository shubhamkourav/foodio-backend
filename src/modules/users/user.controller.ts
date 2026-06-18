import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { getParam } from '../../utils/getParam.js';
import { requireAuth } from '../../utils/requireAuth.js';
import { UPLOAD_FOLDERS, requireUploadedFile, uploadImageToCloudinary } from '../../utils/cloudinaryUpload.js';
import { userService } from './user.service.js';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await userService.getProfile(user.id);
  res.json(ApiResponse.ok(data, 'Profile fetched').toJSON());
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await userService.updateProfile(user.id, req.body);
  res.json(ApiResponse.ok(data, 'Profile updated').toJSON());
});

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const file = requireUploadedFile(req);
  const { url } = await uploadImageToCloudinary(file, UPLOAD_FOLDERS.avatars);
  const data = await userService.updateProfile(user.id, { avatar: url });
  res.json(ApiResponse.ok(data, 'Avatar updated').toJSON());
});

export const getAddresses = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await userService.listAddresses(user.id);
  res.json(ApiResponse.ok(data, 'Addresses fetched').toJSON());
});

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await userService.addAddress(user.id, req.body);
  res.status(201).json(ApiResponse.ok(data, 'Address added', 201).toJSON());
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await userService.updateAddress(user.id, getParam(req.params.id), req.body);
  res.json(ApiResponse.ok(data, 'Address updated').toJSON());
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await userService.deleteAddress(user.id, getParam(req.params.id));
  res.json(ApiResponse.ok(data, 'Address deleted').toJSON());
});
