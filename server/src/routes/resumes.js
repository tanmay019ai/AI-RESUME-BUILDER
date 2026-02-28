import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateResumeLimiter } from '../middleware/rateLimit.js';
import { downloadPdf, generate, getById, updateTemplate } from '../controllers/resumeController.js';

const router = Router();

router.post('/generate', requireAuth, generateResumeLimiter, asyncHandler(generate));
router.get('/:id', requireAuth, asyncHandler(getById));
router.patch('/:id/template', requireAuth, asyncHandler(updateTemplate));
router.get('/:id/pdf', requireAuth, asyncHandler(downloadPdf));

export default router;
