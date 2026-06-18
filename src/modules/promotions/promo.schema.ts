import { z } from 'zod';

export const validatePromoSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
});

export const createPromoSchema = z.object({
  code: z.string().min(2),
  description: z.string().min(1),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.number().min(0),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  usageLimit: z.number().min(1).optional(),
});
