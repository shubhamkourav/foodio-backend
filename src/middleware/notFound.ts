import type { Request, Response } from 'express';

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Route not found',
    data: null,
  });
}
