import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resumes.js';
import paymentRoutes from './routes/payments.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/health', (_req, res) =>
    res.json({
      ok: true,
      env: {
        nodeEnv: env.NODE_ENV,
        geminiMock: env.GEMINI_MOCK,
        geminiConfigured: Boolean(env.GEMINI_API_KEY),
        razorpayConfigured: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET),
      },
    })
  );

  app.use('/api/auth', authRoutes);
  app.use('/api/resumes', resumeRoutes);
  app.use('/api/payments', paymentRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
