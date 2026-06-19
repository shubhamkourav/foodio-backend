import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().min(1),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().optional(),
});
