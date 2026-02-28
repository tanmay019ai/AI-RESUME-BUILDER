import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// Rate limit specifically for resume generation (protects AI credits and server load).
export const generateResumeLimiter = rateLimit({
  windowMs: env.GENERATE_RL_WINDOW_MS,
  max: env.GENERATE_RL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});
