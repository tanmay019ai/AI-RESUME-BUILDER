import { env } from '../config/env.js';

export function notFound(_req, res) {
  res.status(404).json({ message: 'Not found' });
}

// Centralized error handler.
// Keep messages safe for production; log details server-side.
export function errorHandler(err, _req, res, _next) {
  // eslint-disable-next-line no-console
  console.error(err);

  const status = err.statusCode || 500;

  const isProd = env.NODE_ENV === 'production';
  const message = !isProd || err.expose ? err.message : 'Server error';

  // In dev, include a small hint to speed up debugging.
  const payload = { message };
  if (!isProd && err?.stack) {
    payload.stack = String(err.stack).split('\n').slice(0, 6);
  }

  if (err?.retryAfterSec && Number.isFinite(err.retryAfterSec)) {
    res.setHeader('Retry-After', String(err.retryAfterSec));
  }

  res.status(status).json(payload);
}
