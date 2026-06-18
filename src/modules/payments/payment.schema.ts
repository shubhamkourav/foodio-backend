import { z } from 'zod';

import { objectIdSchema } from '../../schemas/common.schema.js';

export const createIntentSchema = z.object({
  orderId: objectIdSchema,
});
