import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';

const router = Router();

router.post('/order', requireAuth, asyncHandler(createOrder));
router.post('/verify', requireAuth, asyncHandler(verifyPayment));

export default router;
