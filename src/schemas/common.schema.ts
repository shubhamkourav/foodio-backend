import mongoose from 'mongoose';
import { z } from 'zod';

function isValidObjectId(value: string): boolean {
  return mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === value;
}

export const objectIdSchema = z
  .string()
  .min(1, 'Id is required')
  .refine(isValidObjectId, { message: 'Invalid id format' });

export const objectIdParam = (key: string) =>
  z.object({
    [key]: objectIdSchema,
  });
