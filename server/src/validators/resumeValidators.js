import { z } from 'zod';
import { TEMPLATE_IDS } from '../templates/registry.js';

export const resumeGenerateSchema = z.object({
  templateId: z
    .string()
    .default('modern-clean')
    .refine((v) => TEMPLATE_IDS.includes(v), { message: 'Invalid template' }),
  photoDataUrl: z
    .string()
    .max(600_000)
    .refine((v) => /^data:image\/(png|jpe?g|webp);base64,[a-z0-9+/=\s]+$/i.test(v), {
      message: 'Invalid photo format (use PNG/JPG/WebP)'
    })
    .optional(),
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(6).max(30),
  skills: z.array(z.string().min(1).max(50)).min(1).max(50),
  projects: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        description: z.string().min(1).max(2000),
      })
    )
    .max(20)
    .default([]),
  experience: z.string().min(1).max(4000),
  education: z.string().min(1).max(2000),
  targetRole: z.string().min(2).max(120),
});
