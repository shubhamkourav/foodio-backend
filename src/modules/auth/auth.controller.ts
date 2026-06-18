import type { Request, Response } from 'express';

import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { requireAuth } from '../../utils/requireAuth.js';
import { authService } from './auth.service.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.register(req.body);
  res.status(201).json(ApiResponse.ok(data, 'Registration successful', 201).toJSON());
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.verifyOtp(req.body.email, req.body.code);
  res.json(ApiResponse.ok(data, 'OTP verified').toJSON());
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.login(req.body.email, req.body.password);
  res.json(ApiResponse.ok(data, 'Login successful').toJSON());
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.refresh(req.body.refreshToken);
  res.json(ApiResponse.ok(data, 'Token refreshed').toJSON());
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const user = requireAuth(req);
  const data = await authService.logout(user.id);
  res.json(ApiResponse.ok(data, 'Logged out').toJSON());
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.forgotPassword(req.body.email);
  res.json(ApiResponse.ok(data, 'Reset OTP sent').toJSON());
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.resetPassword(
    req.body.email,
    req.body.code,
    req.body.password,
  );
  res.json(ApiResponse.ok(data, 'Password reset successful').toJSON());
});
