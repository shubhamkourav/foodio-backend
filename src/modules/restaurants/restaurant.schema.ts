import { z } from 'zod';

import { objectIdSchema } from '../../schemas/common.schema.js';

export const listRestaurantsSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  cuisine: z.string().optional(),
  minRating: z.coerce.number().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().optional(),
});

export const restaurantIdSchema = z.object({
  id: objectIdSchema,
});

export const createRestaurantSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  coverImage: z.string().url().optional(),
  logoImage: z.string().url().optional(),
  cuisines: z.array(z.string()).min(1),
  deliveryTimeMin: z.number().min(1),
  deliveryFee: z.number().min(0),
  minOrderAmount: z.number().min(0),
  isOpen: z.boolean().optional(),
  lat: z.number(),
  lng: z.number(),
  address: z.string().min(1),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();
