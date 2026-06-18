import { z } from 'zod';

import { objectIdSchema } from '../../schemas/common.schema.js';

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional(),
});

export const addressSchema = z.object({
  label: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  isDefault: z.boolean().optional(),
  deliveryOption: z.enum(['meet_outside', 'meet_at_door', 'leave_at_door']).optional(),
  deliveryInstructions: z.string().max(500).optional(),
});

export const addressIdSchema = z.object({
  id: objectIdSchema,
});
