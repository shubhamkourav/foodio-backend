import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import apiRoutes from './routes/index.js';
import { paymentService } from './modules/payments/payment.service.js';
import { asyncHandler } from './utils/asyncHandler.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(rateLimiter);

app.post(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    const signature = req.headers['stripe-signature'] as string | undefined;
    const data = await paymentService.handleWebhook(req.body as Buffer, signature);
    res.json(data);
  }),
);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', message: 'Foodio API is running' });
});

app.use('/api/v1', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
