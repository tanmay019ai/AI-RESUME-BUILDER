import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

function getRazorpay() {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    const err = new Error('Razorpay is not configured (missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET)');
    err.statusCode = 500;
    err.expose = true;
    throw err;
  }
  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

export async function createOrder(req, res) {
  const razorpay = getRazorpay();
  // Amount is controlled server-side.
  const order = await razorpay.orders.create({
    amount: env.PRO_PLAN_AMOUNT_PAISE,
    currency: env.PRO_PLAN_CURRENCY,
    receipt: `pro_${req.user._id}_${Date.now()}`,
  });

  return res.json({
    order,
    keyId: env.RAZORPAY_KEY_ID,
  });
}

export async function verifyPayment(req, res) {
  // Validates Razorpay env vars.
  getRazorpay();

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: 'Missing payment verification fields' });
  }

  // Razorpay signature verification:
  // signature = HMAC_SHA256(order_id + '|' + payment_id, key_secret)
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET).update(body).digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  await User.updateOne({ _id: req.user._id }, { $set: { isPro: true } });
  const user = await User.findById(req.user._id).select('-password');

  return res.json({ message: 'Upgraded to Pro', user });
}
