import { z } from 'zod';

import { objectIdSchema } from '../../schemas/common.schema.js';

const orderItemSchema = z.object({
  menuItemId: objectIdSchema,
  quantity: z.number().min(1),
  selectedCustomizations: z
    .array(
      z.object({
        groupName: z.string(),
        optionName: z.string(),
        priceModifier: z.number(),
      }),
    )
    .optional(),
});

export const placeOrderSchema = z.object({
  restaurantId: objectIdSchema,
  items: z.array(orderItemSchema).min(1),
  deliveryAddress: z.object({
    label: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    lat: z.number(),
    lng: z.number(),
    deliveryOption: z.enum(['meet_outside', 'meet_at_door', 'leave_at_door']).optional(),
    deliveryInstructions: z.string().max(500).optional(),
  }),
  paymentMethod: z.enum(['card', 'upi', 'cod']),
  promoCode: z.string().optional(),
});

export const orderIdSchema = z.object({
  id: objectIdSchema,
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['confirmed', 'preparing', 'picked_up', 'delivered', 'cancelled']),
});

export const listOrdersSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
