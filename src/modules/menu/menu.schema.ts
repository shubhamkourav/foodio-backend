import { z } from 'zod';

import { objectIdSchema } from '../../schemas/common.schema.js';

export const restaurantIdParamSchema = z.object({
  restaurantId: objectIdSchema,
});

export const itemIdParamSchema = z.object({
  restaurantId: objectIdSchema,
  itemId: objectIdSchema,
});

export const listMenuItemsSchema = z.object({
  categoryId: objectIdSchema.optional(),
  q: z.string().trim().min(1).optional(),
  isVeg: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1),
  sortOrder: z.number().optional(),
});

export const createMenuItemSchema = z.object({
  categoryId: objectIdSchema,
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().url().optional(),
  price: z.number().min(0),
  isAvailable: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isVeg: z.boolean().optional(),
  customizations: z
    .array(
      z.object({
        groupName: z.string(),
        required: z.boolean(),
        multiSelect: z.boolean(),
        options: z.array(
          z.object({
            name: z.string(),
            priceModifier: z.number(),
          }),
        ),
      }),
    )
    .optional(),
  tags: z.array(z.string()).optional(),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();
