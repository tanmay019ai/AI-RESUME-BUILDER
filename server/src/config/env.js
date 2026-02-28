import dotenv from 'dotenv';

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function optional(name, fallback = undefined) {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;
  return value;
}

function optionalBool(name, fallback = false) {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: Number(process.env.PORT || 8080),
  // Default helps local dev; production should always set this explicitly.
  MONGODB_URI: optional('MONGODB_URI', 'mongodb://127.0.0.1:27017/ai_resume_builder'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_ORIGIN: optional('CLIENT_ORIGIN', 'http://localhost:5173'),

  GEMINI_API_KEY: optional('GEMINI_API_KEY'),
  // Optional: if omitted/invalid we auto-select a supported model at runtime.
  GEMINI_MODEL: optional('GEMINI_MODEL'),
  // Dev/demo escape hatch when Gemini quota/billing isn't available.
  GEMINI_MOCK: optionalBool('GEMINI_MOCK', false),

  RAZORPAY_KEY_ID: optional('RAZORPAY_KEY_ID'),
  RAZORPAY_KEY_SECRET: optional('RAZORPAY_KEY_SECRET'),
  PRO_PLAN_AMOUNT_PAISE: Number(process.env.PRO_PLAN_AMOUNT_PAISE || 19900),
  PRO_PLAN_CURRENCY: optional('PRO_PLAN_CURRENCY', 'INR'),

  GENERATE_RL_WINDOW_MS: Number(process.env.GENERATE_RL_WINDOW_MS || 15 * 60 * 1000),
  GENERATE_RL_MAX: Number(process.env.GENERATE_RL_MAX || 10),
};
